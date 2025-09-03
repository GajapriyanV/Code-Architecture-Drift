#!/usr/bin/env python3
"""
Test script for the Drift Analyzer
This script tests the analyzer with sample rules and a mock repository structure
"""

import os
import tempfile
import json
from analysis.scan import analyze_repo

def create_mock_repo():
    """Create a mock repository structure for testing and return its persistent path"""
    temp_dir = tempfile.mkdtemp(prefix="drift-analyzer-")

    # Create directory structure
    os.makedirs(os.path.join(temp_dir, "app", "controllers"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "app", "services"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "app", "repositories"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "frontend", "components"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "frontend", "services"), exist_ok=True)
    
    # Create sample Ruby files
    with open(os.path.join(temp_dir, "app", "controllers", "users_controller.rb"), "w") as f:
        f.write("""
class UsersController < ApplicationController
  def index
    @users = User.where(active: true)
    @users = User.find(params[:id])
  end
  
  def create
    user = UserRepository.new.create(user_params)
    render json: user
  end
end
""")
    
    with open(os.path.join(temp_dir, "app", "services", "user_service.rb"), "w") as f:
        f.write("""
class UserService
  def initialize(user_repository)
    @user_repository = user_repository
  end
  
  def create_user(params)
    @user_repository.create(params)
  end
end
""")
    
    with open(os.path.join(temp_dir, "app", "repositories", "user_repository.rb"), "w") as f:
        f.write("""
class UserRepository
  def create(params)
    User.create(params)
  end
end
""")
    
    # Create sample TypeScript files
    with open(os.path.join(temp_dir, "frontend", "components", "UserList.tsx"), "w") as f:
        f.write("""
import React from 'react';
import { UserService } from '../services/UserService';

export const UserList: React.FC = () => {
  return <div>User List Component</div>;
};
""")
    
    with open(os.path.join(temp_dir, "frontend", "services", "UserService.ts"), "w") as f:
        f.write("""
export class UserService {
  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
  }
}
""")
    
    return temp_dir

def test_analyzer():
    """Test the analyzer with sample rules"""
    
    # Sample architecture rules
    rules = {
        "layers": [
            {
                "name": "controllers",
                "patterns": ["app/controllers/**/*.rb"]
            },
            {
                "name": "services", 
                "patterns": ["app/services/**/*.rb"]
            },
            {
                "name": "repositories",
                "patterns": ["app/repositories/**/*.rb"]
            },
            {
                "name": "frontend",
                "patterns": ["frontend/**/*.{ts,tsx}"]
            }
        ],
        "forbidden_dependencies": [
            {"from": "controllers", "to": "repositories"}
        ],
        "must_route_via": [
            {"from": "controllers", "to": "repositories", "via": "services"}
        ],
        "disallowed_apis": [
            {
                "layer": "controllers",
                "patterns": ["ActiveRecord::Base", "\\.where\\(", "\\.find\\("]
            }
        ]
    }
    
    print("🧪 Testing Drift Analyzer...")
    print("=" * 50)
    
    # Create mock repository
    repo_path = create_mock_repo()
    print(f"📁 Created mock repository at: {repo_path}")
    
    try:
        # Run analysis
        print("\n🔍 Running analysis...")
        result = analyze_repo(repo_path, rules)
        
        # Display results
        print("\n📊 Analysis Results:")
        print(f"   Files analyzed: {result['metrics']['counts']['nodes']}")
        print(f"   Dependencies found: {result['metrics']['counts']['edges']}")
        print(f"   Violations detected: {result['metrics']['counts']['violations']}")
        print(f"   Drift score: {result['metrics']['drift_score']:.3f}")
        
        # Show violations
        if result['violations']:
            print("\n🚨 Violations Found:")
            for i, violation in enumerate(result['violations'], 1):
                print(f"   {i}. {violation['rule_code']} - {violation['severity']}")
                print(f"      File: {violation['node_path']}")
                print(f"      Details: {violation['details']}")
                print(f"      Suggestion: {violation['suggestion']}")
                print()
        else:
            print("\n✅ No violations found!")
        
        # Show dependency graph
        print("\n🔗 Dependency Graph:")
        for edge in result['edges']:
            print(f"   {edge['from_path']} → {edge['to_path']} ({edge['edge_type']})")
        
        print("\n🎉 Test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_analyzer()
    exit(0 if success else 1)
