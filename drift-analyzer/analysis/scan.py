import glob
import os
import re
import yaml
from typing import List, Dict, Any

def analyze_repo(root: str, rules: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a repository for architecture drift violations
    
    Args:
        root: Path to the repository root
        rules: Architecture rules dictionary
        
    Returns:
        Dictionary containing analysis results
    """
    nodes = collect_nodes(root, rules)
    edges = collect_ts_import_edges(root) + collect_ruby_db_calls(root)
    violations = check_rules(nodes, edges, rules, root)
    
    # Calculate drift score (0 = no violations, 1 = all edges are violations)
    drift_score = len(violations) / max(len(edges), 1)
    
    return {
        "nodes": nodes,
        "edges": edges,
        "violations": violations,
        "metrics": {
            "drift_score": round(drift_score, 3),
            "counts": {
                "nodes": len(nodes),
                "edges": len(edges),
                "violations": len(violations)
            }
        }
    }

def collect_nodes(root: str, rules: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Collect all source code files and assign them to architectural layers
    """
    files = []
    
    # Collect Ruby files
    ruby_files = glob.glob(os.path.join(root, "**", "*.rb"), recursive=True)
    for p in ruby_files:
        rp = os.path.relpath(p, root)
        layer = assign_layer(rp, rules.get("layers", []))
        files.append({
            "path": rp,
            "module_name": rp.replace("/", ".").replace(".rb", ""),
            "layer": layer,
            "lang": "ruby"
        })
    
    # Collect TypeScript/JavaScript files
    ts_files = glob.glob(os.path.join(root, "**", "*.ts*"), recursive=True)
    for p in ts_files:
        rp = os.path.relpath(p, root)
        layer = assign_layer(rp, rules.get("layers", []))
        files.append({
            "path": rp,
            "module_name": rp.replace("/", ".").replace(".ts", "").replace(".tsx", ""),
            "layer": layer,
            "lang": "typescript"
        })
    
    return files

def assign_layer(path: str, layers: List[Dict[str, Any]]) -> str:
    """
    Assign a file path to an architectural layer based on patterns
    """
    # Normalize path separators to forward slashes for consistent pattern matching
    normalized_path = path.replace('\\', '/')
    
    for layer in layers:
        for pattern in layer["patterns"]:
            # Normalize pattern separators too
            normalized_pattern = pattern.replace('\\', '/')
            if glob.fnmatch.fnmatch(normalized_path, normalized_pattern):
                return layer["name"]
    return "unknown"

def collect_ts_import_edges(root: str) -> List[Dict[str, str]]:
    """
    Collect TypeScript import dependencies
    """
    edges = []
    
    for p in glob.glob(os.path.join(root, "**", "*.ts*"), recursive=True):
        rp = os.path.relpath(p, root)
        
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                for line_num, line in enumerate(f, 1):
                    # Match import statements
                    import_match = re.match(r'^\s*import\s+.*from\s+[\'"](.+)[\'"]', line)
                    if import_match:
                        spec = import_match.group(1)
                        
                        # Handle relative imports
                        if spec.startswith("."):
                            target = os.path.normpath(os.path.join(os.path.dirname(rp), spec))
                            
                            # Resolve file extensions
                            if not target.endswith((".ts", ".tsx")):
                                for ext in (".ts", ".tsx", ".d.ts", "/index.ts", "/index.tsx"):
                                    if os.path.exists(os.path.join(root, target + ext)):
                                        target = target + ext
                                        break
                            
                            edges.append({
                                "from_path": rp,
                                "to_path": target,
                                "edge_type": "import",
                                "line_number": line_num
                            })
                        
                        # Handle absolute imports (from node_modules or aliases)
                        elif not spec.startswith("/"):
                            edges.append({
                                "from_path": rp,
                                "to_path": f"EXTERNAL:{spec}",
                                "edge_type": "import",
                                "line_number": line_num
                            })
        except Exception as e:
            # Log error but continue processing
            print(f"Error processing {p}: {e}")
    
    return edges

def collect_ruby_db_calls(root: str) -> List[Dict[str, str]]:
    """
    Collect Ruby database access patterns
    """
    edges = []
    
    for p in glob.glob(os.path.join(root, "**", "*.rb"), recursive=True):
        rp = os.path.relpath(p, root)
        
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
                # Check for ActiveRecord patterns
                if re.search(r'\.where\(|\.find\(|ActiveRecord::Base', content):
                    edges.append({
                        "from_path": rp,
                        "to_path": "DATABASE",
                        "edge_type": "db_call"
                    })
                
                # Check for direct model calls
                if re.search(r'\.create\(|\.update\(|\.destroy\(', content):
                    edges.append({
                        "from_path": rp,
                        "to_path": "DATABASE",
                        "edge_type": "db_call"
                    })
        except Exception as e:
            # Log error but continue processing
            print(f"Error processing {p}: {e}")
    
    return edges

def check_rules(nodes: List[Dict[str, str]], edges: List[Dict[str, str]], rules: Dict[str, Any], root: str = "") -> List[Dict[str, Any]]:
    """
    Check edges against architecture rules and generate violations
    """
    violations = []
    
    # Create a map of file paths to layers
    layer_map = {node["path"]: node.get("layer", "unknown") for node in nodes}
    
    # Check forbidden dependencies
    for forbidden_dep in rules.get("forbidden_dependencies", []):
        for edge in edges:
            from_layer = layer_map.get(edge["from_path"])
            to_layer = layer_map.get(edge["to_path"])
            
            if (from_layer == forbidden_dep["from"] and 
                to_layer == forbidden_dep["to"]):
                violations.append({
                    "rule_code": "FORBIDDEN_DEP",
                    "severity": "high",
                    "node_path": edge["from_path"],
                    "details": f"Direct dependency from {forbidden_dep['from']} to {forbidden_dep['to']}: {edge['from_path']} → {edge['to_path']}",
                    "suggestion": "Route via allowed layer (see must_route_via rules).",
                    "edge_type": edge.get("edge_type", "unknown")
                })
    
    # Check must_route_via rules
    for route_rule in rules.get("must_route_via", []):
        for edge in edges:
            from_layer = layer_map.get(edge["from_path"])
            to_layer = layer_map.get(edge["to_path"])
            
            if (from_layer == route_rule["from"] and 
                to_layer == route_rule["to"]):
                violations.append({
                    "rule_code": "BYPASS_LAYER",
                    "severity": "medium",
                    "node_path": edge["from_path"],
                    "details": f"Direct {route_rule['from']} → {route_rule['to']} edge (should go via {route_rule['via']})",
                    "suggestion": f"Introduce {route_rule['via']} boundary layer.",
                    "edge_type": edge.get("edge_type", "unknown")
                })
    
    # Check disallowed APIs
    for disallowed_api in rules.get("disallowed_apis", []):
        for node in nodes:
            if node.get("layer") == disallowed_api["layer"]:
                file_path = os.path.join(root, node["path"]) if root else node["path"]
                if os.path.exists(file_path):
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            
                        for pattern in disallowed_api["patterns"]:
                            if re.search(pattern, content):
                                violations.append({
                                    "rule_code": "DISALLOWED_API",
                                    "severity": "medium",
                                    "node_path": node["path"],
                                    "details": f"Pattern `{pattern}` matched in {node['path']}",
                                    "suggestion": "Move database access to appropriate service/repository layer.",
                                    "edge_type": "api_usage"
                                })
                                break
                    except Exception as e:
                        print(f"Error checking disallowed APIs in {file_path}: {e}")
    
    return violations
