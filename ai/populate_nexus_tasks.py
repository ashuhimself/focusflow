#!/usr/bin/env python3
"""
Project Nexus Task Population Script
Creates all tracks, sprints, and tasks for the 3-month intensive learning plan.
Prioritizes AWS Cert, DevOps/K8s, Helm, and Jenkins with heavy focus.
"""

import requests
import json
from datetime import datetime, date, timedelta
from typing import Dict, List

class FocusFlowAPI:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.token = None
        self.workspace_id = None
        self.login(username, password)
    
    def login(self, username: str, password: str):
        """Authenticate and get token"""
        response = self.session.post(f'{self.base_url}/token/', {
            'username': username,
            'password': password
        })
        response.raise_for_status()
        data = response.json()
        self.token = data['access']
        self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        
        # Get current user workspace
        user_response = self.session.get(f'{self.base_url}/auth/me/')
        user_response.raise_for_status()
        self.workspace_id = user_response.json()['workspace']['user']
    
    def create_category(self, name: str, description: str) -> dict:
        """Create a category"""
        data = {
            'name': name,
            'description': description
        }
        response = self.session.post(f'{self.base_url}/categories/', data)
        response.raise_for_status()
        return response.json()
    
    def create_track(self, title: str, description: str, category_id: int, deadline: str) -> dict:
        """Create a track"""
        data = {
            'title': title,
            'description': description,
            'category': category_id,
            'deadline': deadline,
            'is_active': True
        }
        response = self.session.post(f'{self.base_url}/tracks/', data)
        response.raise_for_status()
        return response.json()
    
    def create_sprint(self, track_id: int, name: str, start_date: str, end_date: str, description: str) -> dict:
        """Create a sprint"""
        data = {
            'track': track_id,
            'name': name,
            'start_date': start_date,
            'end_date': end_date,
            'description': description,
            'is_active': True
        }
        response = self.session.post(f'{self.base_url}/sprints/', data)
        response.raise_for_status()
        return response.json()
    
    def create_task(self, track_id: int, sprint_id: int, title: str, description: str, 
                   priority: str = 'MEDIUM', estimated_hours: float = 3.0) -> dict:
        """Create a task"""
        data = {
            'track': track_id,
            'sprint': sprint_id,
            'title': title,
            'description': description,
            'priority': priority,
            'estimated_hours': estimated_hours,
            'status': 'TODO'
        }
        response = self.session.post(f'{self.base_url}/tasks/', data)
        response.raise_for_status()
        return response.json()
        
    def create_track(self, title: str, description: str, category_id: int, deadline: str) -> Dict:
        """Create a track"""
        response = self.session.post(f"{self.base_url}/tracks/", {
            'title': title,
            'description': description,
            'category': category_id,
            'deadline': deadline,
            'is_active': True
        })
        response.raise_for_status()
        track = response.json()
        print(f"✅ Created track: {title}")
        return track
        
    def create_sprint(self, track_id: int, name: str, start_date: str, end_date: str, description: str) -> Dict:
        """Create a sprint"""
        response = self.session.post(f"{self.base_url}/sprints/", {
            'track': track_id,
            'name': name,
            'start_date': start_date,
            'end_date': end_date,
            'description': description,
            'is_active': True
        })
        response.raise_for_status()
        sprint = response.json()
        print(f"✅ Created sprint: {name}")
        return sprint
        
    def create_task(self, track_id: int, sprint_id: int, title: str, description: str, priority: str = 'MEDIUM', estimated_hours: float = 3.0) -> Dict:
        """Create a task"""
        response = self.session.post(f"{self.base_url}/tasks/", {
            'track': track_id,
            'sprint': sprint_id,
            'title': title,
            'description': description,
            'priority': priority,
            'estimated_hours': estimated_hours,
            'status': 'TODO'
        })
        response.raise_for_status()
        task = response.json()
        print(f"✅ Created task: {title}")
        return task


def get_sprint_dates():
    """Calculate sprint dates for 4 weeks (2 sprints of 2 weeks each)"""
    start_date = datetime(2024, 12, 9)  # Starting Monday
    sprints = []
    
    for i in range(4):  # 4 weeks
        week_start = start_date + timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)  # Sunday
        sprints.append({
            'start': week_start.strftime('%Y-%m-%d'),
            'end': week_end.strftime('%Y-%m-%d'),
            'name': f"Week {i+1}"
        })
    
    return sprints


def populate_nexus_data():
    """Main function to populate all Project Nexus data"""
    
    # Initialize API client
    api = FocusFlowAPI(
        base_url="https://breathingmonk.com/api",
        username="ashutosh",
        password="Darunpur@#$2025"
    )
    
    # Login
    api.login()
    
    # Create categories
    categories = {
        'AWS': api.create_category('AWS Certification', 'AWS Solutions Architect Associate preparation'),
        'DevOps': api.create_category('DevOps & Kubernetes', 'DevOps tools, Docker, Kubernetes mastery'),
        'AI': api.create_category('AI Engineering', 'AI APIs, embeddings, vector search'),
        'Backend': api.create_category('Backend Development', 'Django, DRF, WebSockets development'),
        'Data': api.create_category('Data Engineering', 'PySpark, observability, data platforms'),
        'Trading': api.create_category('Trading', 'Financial markets and trading strategies')
    }
    
    # Get sprint dates
    sprint_dates = get_sprint_dates()
    
    # Track definitions with detailed tasks
    tracks_data = {
        'AWS': {
            'title': 'AWS Solutions Architect Associate',
            'description': 'Master AWS services and pass SAA certification by March 2026',
            'deadline': '2026-03-31',
            'tasks_by_week': {
                1: [
                    {'title': 'AWS Global Infrastructure Overview', 'desc': 'Study regions, AZs, edge locations, and global network. Understand latency, availability, and disaster recovery concepts.'},
                    {'title': 'IAM Users, Groups, and Policies', 'desc': 'Create IAM users, attach policies, understand least privilege principle. Practice with AWS CLI authentication.'},
                    {'title': 'IAM Roles and AssumeRole', 'desc': 'Create cross-account roles, EC2 instance roles, and service-linked roles. Understand temporary credentials.'},
                    {'title': 'AWS CLI and SDK Setup', 'desc': 'Install AWS CLI, configure profiles, test basic commands like `aws sts get-caller-identity`.'}
                ],
                2: [
                    {'title': 'VPC Core Concepts', 'desc': 'Create custom VPC with public/private subnets. Understand CIDR blocks, subnet mask calculations.'},
                    {'title': 'Internet Gateway and NAT', 'desc': 'Set up IGW for public subnets, NAT Gateway for private subnet internet access. Test connectivity.'},
                    {'title': 'Route Tables and Routing', 'desc': 'Create route tables, associate with subnets, configure routes for IGW and NAT. Understand longest prefix match.'},
                    {'title': 'VPC Endpoints', 'desc': 'Create Gateway endpoints (S3, DynamoDB) and Interface endpoints. Understand private connectivity benefits.'}
                ],
                3: [
                    {'title': 'Security Groups vs NACLs', 'desc': 'Compare stateful vs stateless firewalls. Create SGs for web tier, app tier, DB tier with proper rules.'},
                    {'title': 'VPC Peering', 'desc': 'Set up VPC peering between two VPCs. Configure route tables, test cross-VPC communication.'},
                    {'title': 'VPC Flow Logs', 'desc': 'Enable VPC Flow Logs, analyze traffic patterns, troubleshoot connectivity issues using logs.'},
                    {'title': 'Transit Gateway', 'desc': 'Understand hub-and-spoke connectivity, route propagation, and multi-VPC architectures.'}
                ],
                4: [
                    {'title': 'EC2 Instance Types', 'desc': 'Compare compute-optimized, memory-optimized, storage-optimized instances. Choose right type for workloads.'},
                    {'title': 'S3 Storage Classes', 'desc': 'Understand Standard, IA, Glacier, Deep Archive. Configure lifecycle policies for cost optimization.'},
                    {'title': 'EBS Volume Types', 'desc': 'Compare GP2, GP3, IO1, IO2, SC1, ST1. Understand IOPS, throughput, and use cases.'},
                    {'title': 'Practice Exam Questions', 'desc': 'Take 50 practice questions covering weeks 1-4 topics. Review incorrect answers and explanations.'}
                ]
            }
        },
        'DevOps': {
            'title': 'DevOps & Kubernetes Mastery',
            'description': 'Master containerization, orchestration, and DevOps practices',
            'deadline': '2026-03-31',
            'tasks_by_week': {
                1: [
                    {'title': 'Linux CLI Essentials', 'desc': 'Master ls, cd, find, grep, awk, sed. Practice file permissions, process management, and shell scripting.'},
                    {'title': 'Docker Architecture', 'desc': 'Understand containers vs VMs, Docker daemon, client-server architecture. Install Docker and run hello-world.'},
                    {'title': 'Docker Images vs Containers', 'desc': 'Pull images from registry, run containers, understand image layers and copy-on-write filesystem.'},
                    {'title': 'Container Lifecycle Management', 'desc': 'Practice start, stop, restart, remove containers. Understand container states and logs inspection.'}
                ],
                2: [
                    {'title': 'Writing Dockerfiles', 'desc': 'Create multi-stage Dockerfiles with FROM, COPY, RUN, EXPOSE, CMD. Understand layer caching and optimization.'},
                    {'title': 'Docker Compose Basics', 'desc': 'Write docker-compose.yml with services, networks, volumes. Orchestrate multi-container applications locally.'},
                    {'title': 'Container Networking', 'desc': 'Understand bridge, host, overlay networks. Configure port mapping and inter-container communication.'},
                    {'title': 'Volume Management', 'desc': 'Use bind mounts, named volumes, tmpfs mounts. Persist data across container restarts and share between containers.'}
                ],
                3: [
                    {'title': 'Kubernetes Architecture', 'desc': 'Understand control plane (API server, etcd, scheduler, controller) vs worker nodes (kubelet, kube-proxy).'},
                    {'title': 'Minikube Setup', 'desc': 'Install minikube, kubectl. Start local cluster, explore dashboard, understand cluster components.'},
                    {'title': 'Pods and Containers', 'desc': 'Create pods with kubectl, understand pod lifecycle, multi-container pods, and pod networking.'},
                    {'title': 'kubectl Fundamentals', 'desc': 'Master kubectl commands: get, describe, create, apply, delete, logs, exec. Use labels and selectors.'}
                ],
                4: [
                    {'title': 'Deployment Manifests', 'desc': 'Write Deployment YAML with replicas, rolling updates, rollbacks. Understand ReplicaSets and pod templates.'},
                    {'title': 'Services and Load Balancing', 'desc': 'Create ClusterIP, NodePort, LoadBalancer services. Understand service discovery and endpoints.'},
                    {'title': 'ConfigMaps and Secrets', 'desc': 'Externalize configuration with ConfigMaps, manage sensitive data with Secrets. Mount as files or env vars.'},
                    {'title': 'Basic Troubleshooting', 'desc': 'Debug pod startup issues, check logs, describe resources, understand common failure scenarios.'}
                ]
            }
        },
        'AI': {
            'title': 'AI Engineering (API-First)',
            'description': 'Master AI APIs, embeddings, and vector search without heavy math',
            'deadline': '2026-03-31',
            'tasks_by_week': {
                1: [
                    {'title': 'OpenAI API Setup', 'desc': 'Get API key, install openai library, set up environment variables securely. Test basic completion API.'},
                    {'title': 'First AI Script', 'desc': 'Write "Hello World" script that calls ChatGPT API, handles responses, and manages rate limits.'},
                    {'title': 'Environment Management', 'desc': 'Use python-dotenv for API keys, create virtual environment, manage dependencies with requirements.txt.'},
                    {'title': 'Error Handling', 'desc': 'Implement proper error handling for API failures, rate limits, invalid responses, and network issues.'}
                ],
                2: [
                    {'title': 'Prompt Engineering Basics', 'desc': 'Understand temperature, max_tokens, top_p parameters. Create effective prompts for different use cases.'},
                    {'title': 'Few-Shot Learning', 'desc': 'Design few-shot prompts with examples. Compare zero-shot vs few-shot performance on classification tasks.'},
                    {'title': 'Prompt Templates', 'desc': 'Create reusable prompt templates with variables. Build a prompt library for common tasks.'},
                    {'title': 'Response Processing', 'desc': 'Parse JSON responses, extract structured data, handle malformed outputs, and validate results.'}
                ],
                3: [
                    {'title': 'Embeddings Concepts', 'desc': 'Understand vector representations of text, semantic similarity, and embedding dimensions. Use OpenAI embeddings API.'},
                    {'title': 'Text Vectorization', 'desc': 'Convert documents to embeddings, batch processing, handle rate limits, and store vectors efficiently.'},
                    {'title': 'Vector Storage', 'desc': 'Set up ChromaDB or Pinecone, store document embeddings, understand metadata and indexing.'},
                    {'title': 'Similarity Search', 'desc': 'Implement cosine similarity search, find nearest neighbors, and rank results by relevance.'}
                ],
                4: [
                    {'title': 'Basic RAG Pipeline', 'desc': 'Build simple Retrieval-Augmented Generation: query → search embeddings → retrieve docs → generate answer.'},
                    {'title': 'Document Chunking', 'desc': 'Split large documents into chunks, handle overlaps, maintain context, and optimize chunk sizes.'},
                    {'title': 'Vector Search API', 'desc': 'Create REST API endpoint for vector search using FastAPI. Accept queries and return ranked results.'},
                    {'title': 'Integration Testing', 'desc': 'Test entire pipeline end-to-end, measure retrieval accuracy, and optimize for response time.'}
                ]
            }
        },
        'Backend': {
            'title': 'Django & WebSockets Mastery',
            'description': 'Master Django REST Framework and real-time features',
            'deadline': '2026-03-31',
            'tasks_by_week': {
                1: [
                    {'title': 'Django Project Setup', 'desc': 'Create new Django project, understand project vs apps, configure settings.py for development.'},
                    {'title': 'MVT Architecture', 'desc': 'Understand Model-View-Template pattern, URL routing, and request-response cycle in Django.'},
                    {'title': 'Virtual Environment', 'desc': 'Set up virtual environment, install Django, create requirements.txt, and understand dependency management.'},
                    {'title': 'Basic Views and URLs', 'desc': 'Create function-based views, map URLs, understand HttpRequest and HttpResponse objects.'}
                ],
                2: [
                    {'title': 'Django Models', 'desc': 'Define models with fields, relationships (ForeignKey, ManyToMany), understand ORM and database abstraction.'},
                    {'title': 'Migrations System', 'desc': 'Create and apply migrations, understand migration files, handle schema changes and data migrations.'},
                    {'title': 'Django Admin', 'desc': 'Register models in admin, customize admin interface, create superuser, and manage data through admin panel.'},
                    {'title': 'QuerySet API', 'desc': 'Master filter, exclude, get, all, create methods. Understand lazy evaluation and database optimization.'}
                ],
                3: [
                    {'title': 'DRF Installation & Setup', 'desc': 'Install Django REST Framework, add to INSTALLED_APPS, configure DRF settings and permissions.'},
                    {'title': 'Serializers', 'desc': 'Create ModelSerializer, handle serialization/deserialization, validation, and nested relationships.'},
                    {'title': 'API Views', 'desc': 'Build APIView and ViewSet classes, understand class-based views vs function-based views.'},
                    {'title': 'First GET API', 'desc': 'Create GET endpoint to list and retrieve model instances. Test with Django shell and browser.'}
                ],
                4: [
                    {'title': 'CRUD Operations', 'desc': 'Implement Create, Read, Update, Delete operations using DRF ViewSets and generic views.'},
                    {'title': 'API Authentication', 'desc': 'Set up Token authentication, create login endpoint, protect views with permissions.'},
                    {'title': 'Postman Testing', 'desc': 'Create Postman collection, test all CRUD endpoints, handle authentication headers.'},
                    {'title': 'API Documentation', 'desc': 'Generate API docs with DRF browsable API, add docstrings, understand API design best practices.'}
                ]
            }
        },
        'Data': {
            'title': 'Data Engineering & Observability',
            'description': 'Master PySpark and observability stack for data platforms',
            'deadline': '2026-03-31',
            'tasks_by_week': {
                1: [
                    {'title': 'PySpark Local Setup', 'desc': 'Install PySpark, set up JAVA_HOME, create SparkSession, understand driver vs executor concepts.'},
                    {'title': 'Spark Architecture', 'desc': 'Understand cluster manager, driver program, executors, and how Spark distributes work across cluster.'},
                    {'title': 'RDD vs DataFrame', 'desc': 'Compare RDDs and DataFrames, understand when to use each, learn about Catalyst optimizer.'},
                    {'title': 'First Spark Job', 'desc': 'Create simple PySpark script to read CSV, perform basic operations, and display results.'}
                ],
                2: [
                    {'title': 'DataFrame Operations', 'desc': 'Master select, filter, groupBy, agg operations. Read CSV files and explore data structures.'},
                    {'title': 'Data Types and Schema', 'desc': 'Define schemas, handle different data types, understand schema inference vs explicit schema definition.'},
                    {'title': 'Observability Pillars', 'desc': 'Learn three pillars: Metrics (quantitative), Logs (events), Traces (request flow). Understand their roles.'},
                    {'title': 'Write to Formats', 'desc': 'Write DataFrames to JSON, Parquet formats. Understand partitioning and performance implications.'}
                ],
                3: [
                    {'title': 'Data Transformations', 'desc': 'Implement complex transformations: joins, window functions, UDFs. Handle missing data and data quality.'},
                    {'title': 'Aggregations', 'desc': 'Perform group-by operations, calculate statistics, create pivot tables, and handle large-scale aggregations.'},
                    {'title': 'File I/O Optimization', 'desc': 'Optimize file reading/writing, understand columnar formats, partitioning strategies.'},
                    {'title': 'Performance Tuning', 'desc': 'Monitor Spark UI, understand stages and tasks, optimize memory usage and parallelism.'}
                ],
                4: [
                    {'title': 'Prometheus Concepts', 'desc': 'Understand metrics types (counter, gauge, histogram), time series data, and PromQL basics.'},
                    {'title': 'Python Metrics Library', 'desc': 'Install prometheus_client, create custom metrics, expose metrics endpoint in Flask/FastAPI app.'},
                    {'title': 'Grafana Dashboard', 'desc': 'Set up Grafana locally, connect to Prometheus, create basic dashboard with panels and alerts.'},
                    {'title': 'Observability Integration', 'desc': 'Add metrics to PySpark jobs, monitor job execution, create alerts for job failures.'}
                ]
            }
        }
    }
    
    # Create tracks and populate tasks
    for track_key, track_data in tracks_data.items():
        category = categories[track_key]
        
        # Create track
        track = api.create_track(
            title=track_data['title'],
            description=track_data['description'],
            category_id=category['id'],
            deadline=track_data['deadline']
        )
        
        # Create sprints and tasks for each week
        for week_num, tasks in track_data['tasks_by_week'].items():
            sprint_info = sprint_dates[week_num - 1]
            
            # Create sprint
            sprint = api.create_sprint(
                track_id=track['id'],
                name=f"{track_data['title']} - {sprint_info['name']}",
                start_date=sprint_info['start'],
                end_date=sprint_info['end'],
                description=f"Week {week_num} tasks for {track_data['title']}"
            )
            
            # Create tasks
            for task_data in tasks:
                api.create_task(
                    track_id=track['id'],
                    sprint_id=sprint['id'],
                    title=task_data['title'],
                    description=task_data['desc'],
                    priority='HIGH' if week_num <= 2 else 'MEDIUM',
                    estimated_hours=3.0
                )
    
    # Create Trading track separately (simpler structure)
    trading_category = api.create_category('Trading', 'Financial markets and trading education')
    trading_track = api.create_track(
        title='Trading Mastery (Varsity)',
        description='Learn financial markets through Zerodha Varsity modules',
        category_id=trading_category['id'],
        deadline='2026-03-31'
    )
    
    # Trading tasks for Thursdays
    trading_modules = [
        'Introduction to Stock Markets',
        'Technical Analysis Basics', 
        'Fundamental Analysis',
        'Options Trading Fundamentals'
    ]
    
    for week_num, module in enumerate(trading_modules, 1):
        sprint_info = sprint_dates[week_num - 1]
        sprint = api.create_sprint(
            track_id=trading_track['id'],
            name=f"Trading Week {week_num}",
            start_date=sprint_info['start'],
            end_date=sprint_info['end'],
            description=f"Focus on {module}"
        )
        
        api.create_task(
            track_id=trading_track['id'],
            sprint_id=sprint['id'],
            title=module,
            description=f"Complete Zerodha Varsity module: {module}. Take notes and practice with examples.",
            priority='LOW',
            estimated_hours=3.0
        )
    
    print("\n🎉 Project Nexus successfully populated in FocusFlow!")
    print(f"Created {len(categories)} categories")
    print(f"Created {len(tracks_data) + 1} tracks") 
    print("Created 4 weeks of sprints with detailed tasks")
    print("\n✅ Ready to start your intensive learning journey!")


if __name__ == "__main__":
    populate_nexus_data()