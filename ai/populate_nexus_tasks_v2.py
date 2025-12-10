#!/usr/bin/env python3
"""
Project Nexus Task Population Script - UPDATED
Creates prioritized 3-month learning plan with 3 sprints per track.
Heavy focus on AWS Cert, DevOps/K8s, Helm, and Jenkins.
Light load on AI, Backend, and Data tracks.
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
        workspaces_response = self.session.get(f'{self.base_url}/workspaces/')
        workspaces_response.raise_for_status()
        workspaces = workspaces_response.json()['results']
        if workspaces:
            self.workspace_id = workspaces[0]['user']['id']
        else:
            raise Exception("No workspace found for user")
    
    def create_category(self, name: str, description: str) -> dict:
        """Create a category"""
        try:
            data = {'name': name, 'description': description}
            response = self.session.post(f'{self.base_url}/categories/', json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 400:
                # Might exist, try to get it
                categories = self.session.get(f'{self.base_url}/categories/').json()['results']
                for cat in categories:
                    if cat['name'] == name:
                        return cat
            raise e
    
    def create_track(self, title: str, description: str, category_id: int, deadline: str) -> dict:
        """Create a track"""
        data = {
            'title': title,
            'description': description,
            'category': category_id,
            'deadline': deadline,
            'is_active': True
        }
        response = self.session.post(f'{self.base_url}/tracks/', json=data)
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
        response = self.session.post(f'{self.base_url}/sprints/', json=data)
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
        response = self.session.post(f'{self.base_url}/tasks/', json=data)
        response.raise_for_status()
        return response.json()

def get_project_nexus_data():
    """Complete Project Nexus learning plan data"""
    
    categories = [
        {
            'name': 'Cloud & Infrastructure',
            'description': 'AWS Certification and cloud architecture mastery - PRIORITY 1'
        },
        {
            'name': 'DevOps & Orchestration', 
            'description': 'Kubernetes, Helm, Jenkins, CI/CD - PRIORITY 2'
        },
        {
            'name': 'AI Engineering',
            'description': 'AI APIs and vector databases - Light focus'
        },
        {
            'name': 'Backend Development',
            'description': 'Django and API development - Light focus'
        },
        {
            'name': 'Data Engineering',
            'description': 'PySpark and observability - Light focus'
        }
    ]
    
    tracks = [
        {
            'title': 'AWS Solutions Architect Associate',
            'description': 'PRIORITY 1: Master AWS services and pass certification by March 2026. 8-hour Saturday intensive sessions.',
            'category': 'Cloud & Infrastructure',
            'deadline': '2026-03-31'
        },
        {
            'title': 'DevOps & Kubernetes Mastery',
            'description': 'PRIORITY 2: Master Docker, Kubernetes, Helm, Jenkins. 8-hour Sunday hands-on sessions.',
            'category': 'DevOps & Orchestration',
            'deadline': '2026-03-31'
        },
        {
            'title': 'AI Engineering (API-First)',
            'description': 'Light focus: AI APIs and vector search. 3-hour Monday sessions.',
            'category': 'AI Engineering',
            'deadline': '2026-03-31'
        },
        {
            'title': 'Django Backend Development',
            'description': 'Light focus: Django and WebSocket development. 3-hour Tuesday sessions.',
            'category': 'Backend Development',
            'deadline': '2026-03-31'
        },
        {
            'title': 'Data Platform & Observability',
            'description': 'Light focus: PySpark and monitoring. 3-hour Wednesday sessions.',
            'category': 'Data Engineering',
            'deadline': '2026-03-31'
        }
    ]
    
    # Sprint definitions
    sprints = {
        'AWS Solutions Architect Associate': [
            {
                'name': 'AWS Foundations (Dec 8-31)',
                'start_date': '2025-12-08',
                'end_date': '2025-12-31',
                'description': 'Heavy focus: IAM, VPC, EC2, S3 fundamentals. 8h Saturday sessions (96h total).'
            },
            {
                'name': 'AWS Core Services (Jan 1-14)',
                'start_date': '2026-01-01',
                'end_date': '2026-01-14',
                'description': 'Intensive: Load balancers, databases, networking services.'
            },
            {
                'name': 'AWS Advanced & Exam Prep (Jan 15-31)',
                'start_date': '2026-01-15',
                'end_date': '2026-01-31',
                'description': 'Final prep: Advanced services, practice exams, certification.'
            }
        ],
        'DevOps & Kubernetes Mastery': [
            {
                'name': 'Docker & Containers (Dec 8-31)',
                'start_date': '2025-12-08',
                'end_date': '2025-12-31',
                'description': 'Heavy focus: Docker mastery, registry, compose. 8h Sunday sessions (96h total).'
            },
            {
                'name': 'Kubernetes Core (Jan 1-14)',
                'start_date': '2026-01-01',
                'end_date': '2026-01-14',
                'description': 'Intensive: K8s architecture, pods, deployments, services.'
            },
            {
                'name': 'Helm & Jenkins CI/CD (Jan 15-31)',
                'start_date': '2026-01-15',
                'end_date': '2026-01-31',
                'description': 'Advanced: Package management, automated pipelines.'
            }
        ],
        'AI Engineering (API-First)': [
            {
                'name': 'AI API Basics (Dec 8-31)',
                'start_date': '2025-12-08',
                'end_date': '2025-12-31',
                'description': 'Light focus: API setup, basic prompting. 3h Monday sessions (36h total).'
            },
            {
                'name': 'Vector & Embeddings (Jan 1-14)',
                'start_date': '2026-01-01',
                'end_date': '2026-01-14',
                'description': 'Vector databases and semantic search basics.'
            },
            {
                'name': 'AI Integration (Jan 15-31)',
                'start_date': '2026-01-15',
                'end_date': '2026-01-31',
                'description': 'Simple RAG implementation and production basics.'
            }
        ],
        'Django Backend Development': [
            {
                'name': 'Django Fundamentals (Dec 8-31)',
                'start_date': '2025-12-08',
                'end_date': '2025-12-31',
                'description': 'Light focus: Django setup and basics. 3h Tuesday sessions (36h total).'
            },
            {
                'name': 'REST APIs (Jan 1-14)',
                'start_date': '2026-01-01',
                'end_date': '2026-01-14',
                'description': 'DRF and authentication basics.'
            },
            {
                'name': 'WebSocket Integration (Jan 15-31)',
                'start_date': '2026-01-15',
                'end_date': '2026-01-31',
                'description': 'Real-time features with Django Channels.'
            }
        ],
        'Data Platform & Observability': [
            {
                'name': 'PySpark Basics (Dec 8-31)',
                'start_date': '2025-12-08',
                'end_date': '2025-12-31',
                'description': 'Light focus: PySpark setup. 3h Wednesday sessions (36h total).'
            },
            {
                'name': 'Data Processing (Jan 1-14)',
                'start_date': '2026-01-01',
                'end_date': '2026-01-14',
                'description': 'Basic data transformations and pipelines.'
            },
            {
                'name': 'Monitoring Setup (Jan 15-31)',
                'start_date': '2026-01-15',
                'end_date': '2026-01-31',
                'description': 'Prometheus and Grafana basics.'
            }
        ]
    }
    
    # Detailed tasks for each sprint (PRIORITY-BASED)
    tasks = {
        # AWS TRACK - HEAVY PRIORITY (96 hours total)
        ('AWS Solutions Architect Associate', 'AWS Foundations (Dec 8-31)'): [
            {
                'title': 'AWS Global Infrastructure Mastery',
                'description': '''**PRIORITY 1 TASK - 8 Hours**

**Learning Objectives:**
- Master AWS Regions, Availability Zones, Edge Locations
- Understand AWS backbone network and global reach
- Learn compliance frameworks and data residency laws

**Deep Dive Topics:**
- 33+ AWS Regions, 100+ AZs worldwide
- Local Zones, Wavelength, Outposts
- CloudFront edge network (400+ locations)
- Data sovereignty (GDPR, SOX, HIPAA)

**Hands-on Practice:**
- Use AWS Global Infrastructure map
- Calculate latency between regions
- Research compliance requirements for different industries

**Deliverable:** Create comprehensive global infrastructure strategy document for multi-region deployment.''',
                'priority': 'HIGH',
                'estimated_hours': 8.0
            },
            {
                'title': 'IAM Deep Dive - Users, Groups, Policies',
                'description': '''**PRIORITY 1 TASK - 12 Hours**

**Learning Objectives:**
- Master IAM users, groups, roles, and policies
- Understand policy evaluation logic and precedence
- Implement zero-trust security model

**Deep Dive Topics:**
- Identity vs resource-based policies
- Policy evaluation flow and explicit deny
- Condition keys and context values
- Cross-account access patterns
- Service Control Policies (SCPs)

**Hands-on Practice:**
- Create complex IAM policies with conditions
- Set up cross-account role assumption
- Implement least privilege access patterns
- Test policy simulation tool

**Deliverable:** Design and implement enterprise IAM architecture with multi-account setup.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            },
            {
                'title': 'VPC Networking Mastery (Critical)',
                'description': '''**CRITICAL PRIORITY TASK - 16 Hours**

**Learning Objectives:**
- Master VPC design patterns and best practices
- Understand advanced networking concepts
- Implement secure multi-tier architectures

**Deep Dive Topics:**
- CIDR block planning and subnetting
- Public vs private vs isolated subnets
- Route tables and longest prefix matching
- Internet Gateway vs NAT Gateway vs NAT Instance
- VPC Endpoints (Gateway and Interface)
- DNS resolution and Route 53 integration

**Hands-on Practice:**
- Design and build production VPC architecture
- Implement 3-tier web application networking
- Set up VPC flow logs and monitoring
- Test network connectivity and troubleshooting

**Deliverable:** Production-ready VPC with complete documentation and network diagrams.''',
                'priority': 'HIGH',
                'estimated_hours': 16.0
            },
            {
                'title': 'EC2 Compute Platform Mastery',
                'description': '''**PRIORITY 1 TASK - 12 Hours**

**Learning Objectives:**
- Master EC2 instance families and optimization
- Understand purchasing models and cost optimization
- Implement auto-scaling and high availability

**Deep Dive Topics:**
- Instance families: General purpose, Compute, Memory, Storage optimized
- Purchasing options: On-demand, Reserved, Spot, Dedicated
- Placement groups and enhanced networking
- User data, metadata service, and instance roles
- EBS volume types and performance optimization

**Hands-on Practice:**
- Deploy multi-instance web application
- Implement auto-scaling with launch templates
- Optimize costs with Reserved and Spot instances
- Set up monitoring and alerting

**Deliverable:** Highly available, cost-optimized compute infrastructure.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            },
            {
                'title': 'S3 Storage Architecture & Optimization',
                'description': '''**PRIORITY 1 TASK - 10 Hours**

**Learning Objectives:**
- Master S3 storage classes and lifecycle management
- Understand security models and access patterns
- Implement cost optimization strategies

**Deep Dive Topics:**
- Storage classes: Standard, IA, Glacier, Deep Archive
- Lifecycle policies and intelligent tiering
- Versioning, MFA delete, and cross-region replication
- Bucket policies, ACLs, and access points
- Transfer acceleration and multipart uploads

**Hands-on Practice:**
- Build data lake architecture with S3
- Implement automated lifecycle policies
- Set up cross-region backup strategy
- Optimize transfer performance and costs

**Deliverable:** Enterprise S3 architecture with comprehensive lifecycle and security policies.''',
                'priority': 'HIGH',
                'estimated_hours': 10.0
            }
        ],
        
        ('AWS Solutions Architect Associate', 'AWS Core Services (Jan 1-14)'): [
            {
                'title': 'Load Balancing & Auto Scaling Mastery',
                'description': '''**PRIORITY 1 TASK - 8 Hours**

**Learning Objectives:**
- Master ELB types and use cases
- Implement intelligent auto-scaling strategies
- Design fault-tolerant architectures

**Deep Dive Topics:**
- ALB vs NLB vs Gateway Load Balancer
- Target groups and health check optimization
- Auto Scaling policies: Target tracking, Step, Simple
- Mixed instance types and Spot integration

**Deliverable:** Highly available web application with intelligent scaling.''',
                'priority': 'HIGH',
                'estimated_hours': 8.0
            },
            {
                'title': 'Database Services Architecture',
                'description': '''**PRIORITY 1 TASK - 10 Hours**

**Learning Objectives:**
- Master RDS, Aurora, and DynamoDB
- Design database scaling strategies
- Implement backup and disaster recovery

**Deep Dive Topics:**
- RDS Multi-AZ vs Read Replicas
- Aurora Serverless and Global Database
- DynamoDB design patterns and GSI/LSI
- Database security and encryption

**Deliverable:** Multi-database architecture with automated backup and scaling.''',
                'priority': 'HIGH',
                'estimated_hours': 10.0
            },
            {
                'title': 'Content Delivery & DNS Optimization',
                'description': '''**PRIORITY 1 TASK - 6 Hours**

**Learning Objectives:**
- Master CloudFront distribution strategies
- Implement intelligent DNS routing
- Optimize global content delivery

**Deep Dive Topics:**
- CloudFront behaviors and cache policies
- Route 53 routing policies and health checks
- SSL/TLS optimization with ACM
- Global latency optimization

**Deliverable:** Global CDN with intelligent routing and SSL optimization.''',
                'priority': 'HIGH',
                'estimated_hours': 6.0
            }
        ],
        
        ('AWS Solutions Architect Associate', 'AWS Advanced & Exam Prep (Jan 15-31)'): [
            {
                'title': 'Security & Compliance Framework',
                'description': '''**CRITICAL EXAM PREP - 12 Hours**

**Learning Objectives:**
- Master AWS security services ecosystem
- Understand compliance and governance
- Implement comprehensive security monitoring

**Deep Dive Topics:**
- CloudTrail, Config, GuardDuty integration
- Security Hub and compliance frameworks
- KMS encryption and key management
- Secrets Manager and Parameter Store

**Deliverable:** Complete security framework with automated compliance monitoring.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            },
            {
                'title': 'Intensive Practice Exams & Review',
                'description': '''**EXAM PREPARATION - 16 Hours**

**Learning Objectives:**
- Master exam scenario analysis
- Perfect timing and question strategies
- Achieve 90%+ practice exam scores

**Deep Dive Topics:**
- Whizlabs, Tutorials Dojo practice exams
- AWS official sample questions
- Architecture scenario analysis
- Cost optimization scenarios
- Disaster recovery planning

**Deliverable:** Consistent 90%+ practice exam scores and exam registration.''',
                'priority': 'HIGH',
                'estimated_hours': 16.0
            }
        ],
        
        # DEVOPS TRACK - HEAVY PRIORITY (96 hours total)
        ('DevOps & Kubernetes Mastery', 'Docker & Containers (Dec 8-31)'): [
            {
                'title': 'Linux System Administration Mastery',
                'description': '''**PRIORITY 2 TASK - 12 Hours**

**Learning Objectives:**
- Master Linux CLI for DevOps operations
- Understand process, network, and file system management
- Automate system tasks with shell scripting

**Deep Dive Topics:**
- Advanced file operations: find, grep, awk, sed
- Process management: systemd, cgroups, namespaces
- Network diagnostics: netstat, ss, tcpdump
- System monitoring: top, htop, iotop, iostat

**Deliverable:** Linux administration automation scripts and monitoring setup.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            },
            {
                'title': 'Docker Production Mastery',
                'description': '''**PRIORITY 2 TASK - 16 Hours**

**Learning Objectives:**
- Master Docker architecture and optimization
- Implement production-ready container strategies
- Understand security and performance best practices

**Deep Dive Topics:**
- Multi-stage builds and layer optimization
- Container networking: bridge, host, overlay
- Volume management and data persistence
- Image scanning and vulnerability management
- Registry authentication and private registries

**Deliverable:** Optimized Docker images with complete CI/CD integration.''',
                'priority': 'HIGH',
                'estimated_hours': 16.0
            },
            {
                'title': 'Docker Compose & Multi-Service Apps',
                'description': '''**PRIORITY 2 TASK - 12 Hours**

**Learning Objectives:**
- Master complex multi-service applications
- Implement service discovery and networking
- Manage secrets and environment configurations

**Deep Dive Topics:**
- Service dependencies and health checks
- Custom networks and service discovery
- Secrets management and environment files
- Development vs production configurations
- Load balancing and scaling strategies

**Deliverable:** Production-ready compose setup for full-stack applications.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            }
        ],
        
        ('DevOps & Kubernetes Mastery', 'Kubernetes Core (Jan 1-14)'): [
            {
                'title': 'Kubernetes Architecture Deep Dive',
                'description': '''**CRITICAL K8S TASK - 12 Hours**

**Learning Objectives:**
- Master K8s control plane and worker node architecture
- Understand cluster networking and service mesh
- Implement cluster security and RBAC

**Deep Dive Topics:**
- API server, etcd, scheduler, controller-manager
- kubelet, kube-proxy, container runtime
- CNI plugins and network policies
- RBAC, service accounts, and pod security

**Deliverable:** Production K8s cluster with security hardening and monitoring.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            },
            {
                'title': 'Workload Management Mastery',
                'description': '''**CRITICAL K8S TASK - 10 Hours**

**Learning Objectives:**
- Master Deployments, StatefulSets, DaemonSets
- Implement advanced scheduling and resource management
- Understand update strategies and rollbacks

**Deep Dive Topics:**
- Rolling updates, blue-green, canary deployments
- Horizontal Pod Autoscaler (HPA) and VPA
- Pod disruption budgets and node affinity
- Resource quotas and limit ranges

**Deliverable:** Scalable application deployment with automated scaling and updates.''',
                'priority': 'HIGH',
                'estimated_hours': 10.0
            }
        ],
        
        ('DevOps & Kubernetes Mastery', 'Helm & Jenkins CI/CD (Jan 15-31)'): [
            {
                'title': 'Helm Package Management Mastery',
                'description': '''**PRIORITY HELM TASK - 12 Hours**

**Learning Objectives:**
- Master Helm charts and templating
- Implement multi-environment deployments
- Create production-ready chart repositories

**Deep Dive Topics:**
- Chart structure and Go templating
- Values files and environment overrides
- Chart dependencies and subcharts
- Helm hooks and lifecycle management
- Chart testing and validation

**Deliverable:** Complete Helm chart library for microservices deployment.''',
                'priority': 'HIGH',
                'estimated_hours': 12.0
            },
            {
                'title': 'Jenkins CI/CD Pipeline Mastery',
                'description': '''**PRIORITY JENKINS TASK - 14 Hours**

**Learning Objectives:**
- Master Jenkins on Kubernetes deployment
- Implement advanced pipeline patterns
- Automate security scanning and testing

**Deep Dive Topics:**
- Jenkins operator and configuration as code
- Declarative pipelines with shared libraries
- Multi-branch pipelines and GitOps
- Security scanning integration (SonarQube, Trivy)
- Blue-green and canary deployment automation

**Deliverable:** Complete CI/CD pipeline with automated testing, security, and deployment.''',
                'priority': 'HIGH',
                'estimated_hours': 14.0
            }
        ],
        
        # AI TRACK - LIGHT FOCUS (36 hours total)
        ('AI Engineering (API-First)', 'AI API Basics (Dec 8-31)'): [
            {
                'title': 'AI API Setup & Best Practices',
                'description': '''**LIGHT FOCUS TASK - 4 Hours**

**Learning Objectives:**
- Setup OpenAI and Anthropic APIs securely
- Understand rate limiting and cost management
- Implement error handling and retry logic

**Basic Topics:**
- API key management and rotation
- Rate limiting strategies
- Cost monitoring and alerts
- Basic error handling patterns

**Deliverable:** Secure API client with monitoring and cost controls.''',
                'priority': 'MEDIUM',
                'estimated_hours': 4.0
            },
            {
                'title': 'Basic Prompt Engineering',
                'description': '''**LIGHT FOCUS TASK - 6 Hours**

**Learning Objectives:**
- Learn prompt structure and parameters
- Understand token management basics
- Implement simple few-shot patterns

**Basic Topics:**
- System vs user messages
- Temperature and token settings
- Simple prompt templates
- Basic context management

**Deliverable:** Prompt testing framework with basic optimization.''',
                'priority': 'MEDIUM',
                'estimated_hours': 6.0
            }
        ],
        
        ('AI Engineering (API-First)', 'Vector & Embeddings (Jan 1-14)'): [
            {
                'title': 'Basic Vector Embeddings',
                'description': '''**LIGHT FOCUS TASK - 6 Hours**

**Learning Objectives:**
- Understand embedding basics
- Learn simple text processing
- Implement basic similarity search

**Basic Topics:**
- OpenAI embedding models
- Text chunking strategies
- Cosine similarity calculation
- Simple vector storage

**Deliverable:** Basic text search with embeddings.''',
                'priority': 'MEDIUM',
                'estimated_hours': 6.0
            }
        ],
        
        ('AI Engineering (API-First)', 'AI Integration (Jan 15-31)'): [
            {
                'title': 'Simple RAG Implementation',
                'description': '''**LIGHT FOCUS TASK - 8 Hours**

**Learning Objectives:**
- Build basic RAG system
- Implement simple document search
- Create Q&A interface

**Basic Topics:**
- Document ingestion pipeline
- Basic retrieval and ranking
- Simple context injection
- Basic web interface

**Deliverable:** Working Q&A system with document search.''',
                'priority': 'MEDIUM',
                'estimated_hours': 8.0
            }
        ],
        
        # BACKEND TRACK - LIGHT FOCUS (36 hours total)
        ('Django Backend Development', 'Django Fundamentals (Dec 8-31)'): [
            {
                'title': 'Django Project Setup & Structure',
                'description': '''**LIGHT FOCUS TASK - 6 Hours**

**Learning Objectives:**
- Setup Django project properly
- Understand MVT architecture
- Configure basic settings

**Basic Topics:**
- Project vs app structure
- Settings organization
- URL routing basics
- Template system setup

**Deliverable:** Well-structured Django project with multiple apps.''',
                'priority': 'MEDIUM',
                'estimated_hours': 6.0
            },
            {
                'title': 'Models & Database Basics',
                'description': '''**LIGHT FOCUS TASK - 6 Hours**

**Learning Objectives:**
- Create Django models
- Understand migrations
- Setup admin interface

**Basic Topics:**
- Model field types
- Basic relationships
- Migration management
- Admin customization

**Deliverable:** Complete data model with admin interface.''',
                'priority': 'MEDIUM',
                'estimated_hours': 6.0
            }
        ],
        
        ('Django Backend Development', 'REST APIs (Jan 1-14)'): [
            {
                'title': 'Django REST Framework Setup',
                'description': '''**LIGHT FOCUS TASK - 8 Hours**

**Learning Objectives:**
- Install and configure DRF
- Create basic API endpoints
- Implement authentication

**Basic Topics:**
- DRF installation
- Serializers and viewsets
- Basic authentication
- API documentation

**Deliverable:** REST API with CRUD operations.''',
                'priority': 'MEDIUM',
                'estimated_hours': 8.0
            }
        ],
        
        ('Django Backend Development', 'WebSocket Integration (Jan 15-31)'): [
            {
                'title': 'Django Channels Basics',
                'description': '''**LIGHT FOCUS TASK - 10 Hours**

**Learning Objectives:**
- Setup Django Channels
- Create simple WebSocket consumers
- Implement basic real-time features

**Basic Topics:**
- Channels installation
- Basic consumers
- WebSocket routing
- Simple broadcasting

**Deliverable:** Real-time chat or notification system.''',
                'priority': 'MEDIUM',
                'estimated_hours': 10.0
            }
        ],
        
        # DATA TRACK - LIGHT FOCUS (36 hours total) 
        ('Data Platform & Observability', 'PySpark Basics (Dec 8-31)'): [
            {
                'title': 'PySpark Local Setup',
                'description': '''**LIGHT FOCUS TASK - 6 Hours**

**Learning Objectives:**
- Setup local PySpark environment
- Understand basic architecture
- Create simple DataFrames

**Basic Topics:**
- Spark installation
- Driver vs executor concepts
- Basic DataFrame operations
- Reading CSV/JSON files

**Deliverable:** Working PySpark environment with basic data processing.''',
                'priority': 'MEDIUM',
                'estimated_hours': 6.0
            },
            {
                'title': 'Basic Data Transformations',
                'description': '''**LIGHT FOCUS TASK - 6 Hours**

**Learning Objectives:**
- Learn DataFrame operations
- Understand lazy evaluation
- Implement basic transformations

**Basic Topics:**
- Select, filter, groupBy operations
- Basic aggregations
- Writing output files
- Performance basics

**Deliverable:** Data transformation pipeline with multiple formats.''',
                'priority': 'MEDIUM',
                'estimated_hours': 6.0
            }
        ],
        
        ('Data Platform & Observability', 'Data Processing (Jan 1-14)'): [
            {
                'title': 'Advanced PySpark Operations',
                'description': '''**LIGHT FOCUS TASK - 8 Hours**

**Learning Objectives:**
- Learn complex transformations
- Understand join strategies
- Implement window functions

**Basic Topics:**
- Complex aggregations
- Join optimization
- Window functions
- UDF basics

**Deliverable:** Advanced analytics pipeline.''',
                'priority': 'MEDIUM',
                'estimated_hours': 8.0
            }
        ],
        
        ('Data Platform & Observability', 'Monitoring Setup (Jan 15-31)'): [
            {
                'title': 'Prometheus & Grafana Basics',
                'description': '''**LIGHT FOCUS TASK - 8 Hours**

**Learning Objectives:**
- Setup Prometheus metrics
- Create basic Grafana dashboards
- Implement simple alerting

**Basic Topics:**
- Metric types and collection
- Basic PromQL queries
- Dashboard creation
- Alert configuration

**Deliverable:** Basic monitoring dashboard with alerts.''',
                'priority': 'MEDIUM',
                'estimated_hours': 8.0
            }
        ]
    }
    
    return categories, tracks, sprints, tasks

def main():
    """Execute the Project Nexus population"""
    print("🚀 Project Nexus - PRIORITIZED Learning Plan")
    print("=" * 60)
    print("📊 PRIORITIES:")
    print("  🔥 PRIORITY 1: AWS Certification (96h) - Saturdays")  
    print("  🔥 PRIORITY 2: DevOps/K8s/Helm/Jenkins (96h) - Sundays")
    print("  📝 Light Focus: AI (36h), Backend (36h), Data (36h)")
    print("=" * 60)
    
    # Get credentials
    print("\n🔐 API Connection:")
    api = FocusFlowAPI(
        base_url="https://breathingmonk.com/api",
        username="ashutosh",
        password="Darunpur@#$2025"
    )
    print(f"✅ Connected to workspace: {api.workspace_id}")
    
    # Get all data
    categories, tracks, sprints, tasks = get_project_nexus_data()
    
    # Create categories
    print("\n📁 Creating Categories...")
    created_categories = {}
    for cat_data in categories:
        try:
            category = api.create_category(cat_data['name'], cat_data['description'])
            created_categories[cat_data['name']] = category
            print(f"  ✅ {cat_data['name']}")
        except Exception as e:
            print(f"  ❌ {cat_data['name']}: {e}")
    
    # Create tracks
    print("\n🎯 Creating Tracks...")
    created_tracks = {}
    for track_data in tracks:
        try:
            category_id = created_categories[track_data['category']]['id']
            track = api.create_track(
                track_data['title'],
                track_data['description'],
                category_id,
                track_data['deadline']
            )
            created_tracks[track_data['title']] = track
            print(f"  ✅ {track_data['title']}")
        except Exception as e:
            print(f"  ❌ {track_data['title']}: {e}")
    
    # Create sprints
    print("\n🏃 Creating Sprints...")
    created_sprints = {}
    for track_title, sprint_list in sprints.items():
        if track_title not in created_tracks:
            continue
            
        track_id = created_tracks[track_title]['id']
        created_sprints[track_title] = {}
        
        for sprint_data in sprint_list:
            try:
                sprint = api.create_sprint(
                    track_id,
                    sprint_data['name'],
                    sprint_data['start_date'],
                    sprint_data['end_date'],
                    sprint_data['description']
                )
                created_sprints[track_title][sprint_data['name']] = sprint
                print(f"  ✅ {sprint_data['name']}")
            except Exception as e:
                print(f"  ❌ {sprint_data['name']}: {e}")
    
    # Create tasks
    print("\n📋 Creating Tasks...")
    total_tasks = 0
    priority_counts = {'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
    
    for (track_title, sprint_name), task_list in tasks.items():
        if track_title not in created_tracks or track_title not in created_sprints:
            continue
        if sprint_name not in created_sprints[track_title]:
            continue
            
        track_id = created_tracks[track_title]['id']
        sprint_id = created_sprints[track_title][sprint_name]['id']
        
        for task_data in task_list:
            try:
                task = api.create_task(
                    track_id,
                    sprint_id,
                    task_data['title'],
                    task_data['description'],
                    task_data['priority'],
                    task_data['estimated_hours']
                )
                total_tasks += 1
                priority_counts[task_data['priority']] += 1
                priority_icon = "🔥" if task_data['priority'] == 'HIGH' else "📝"
                print(f"  ✅ {priority_icon} {task_data['title']} ({task_data['estimated_hours']}h)")
            except Exception as e:
                print(f"  ❌ {task_data['title']}: {e}")
    
    # Summary
    print(f"\n🎉 Project Nexus Population Complete!")
    print(f"📊 FINAL SUMMARY:")
    print(f"  📁 Categories: {len(created_categories)}")
    print(f"  🎯 Tracks: {len(created_tracks)}")
    print(f"  🏃 Sprints: {sum(len(s) for s in created_sprints.values())}")
    print(f"  📋 Tasks: {total_tasks}")
    print(f"  🔥 High Priority: {priority_counts['HIGH']} tasks")
    print(f"  📝 Medium Priority: {priority_counts['MEDIUM']} tasks")
    print(f"\n🚀 READY TO LAUNCH PROJECT NEXUS!")
    print(f"📅 Today is Sunday (Dec 8) - Start with DevOps & K8s track!")
    print(f"🎯 Next: AWS Certification track on Saturday!")

if __name__ == "__main__":
    main()