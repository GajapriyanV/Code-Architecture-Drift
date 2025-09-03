#!/usr/bin/env python3
"""
Local test script for the drift analyzer
Tests the analyzer on the current project structure
"""

import os
import sys
import yaml
from pathlib import Path

# Add the current directory to Python path so we can import analysis.scan
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analysis.scan import analyze_repo

def test_local_analysis():
    """Test the drift analyzer on the current project"""
    
    # Get the project root (parent of drift-analyzer directory)
    project_root = Path(__file__).parent.parent.absolute()
    
    # Load the sample architecture rules
    rules_file = Path(__file__).parent / "sample_architecture.yml"
    with open(rules_file, 'r') as f:
        rules = yaml.safe_load(f)
    
    print(f"Testing drift analyzer on project: {project_root}")
    print(f"Using rules from: {rules_file}")
    print("\n" + "="*50)
    
    try:
        # Analyze the repository
        result = analyze_repo(str(project_root), rules)
        
        # Print results
        print("ANALYSIS RESULTS:")
        print(f"Drift Score: {result['metrics']['drift_score']}")
        print(f"Total Nodes: {result['metrics']['counts']['nodes']}")
        print(f"Total Edges: {result['metrics']['counts']['edges']}")
        print(f"Total Violations: {result['metrics']['counts']['violations']}")
        
        print("\n" + "="*50)
        print("VIOLATIONS:")
        if result['violations']:
            for i, violation in enumerate(result['violations'], 1):
                print(f"\n{i}. {violation['rule_code']} - {violation['severity']}")
                print(f"   File: {violation['node_path']}")
                print(f"   Details: {violation['details']}")
                print(f"   Suggestion: {violation['suggestion']}")
        else:
            print("No violations found! 🎉")
        
        print("\n" + "="*50)
        print("SAMPLE NODES (first 10):")
        for node in result['nodes'][:10]:
            print(f"  {node['path']} -> {node['layer']} ({node['lang']})")
        
        if len(result['nodes']) > 10:
            print(f"  ... and {len(result['nodes']) - 10} more nodes")
        
        print("\n" + "="*50)
        print("SAMPLE EDGES (first 10):")
        for edge in result['edges'][:10]:
            print(f"  {edge['from_path']} -> {edge['to_path']} ({edge['edge_type']})")
        
        if len(result['edges']) > 10:
            print(f"  ... and {len(result['edges']) - 10} more edges")
            
    except Exception as e:
        print(f"Error during analysis: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_local_analysis()
