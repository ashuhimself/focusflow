"""
Django management command to populate the 3-month learning plan.
Run with: python manage.py populate_learning_plan
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
from core.models import Workspace, Category, Track, Sprint, Task


class Command(BaseCommand):
    help = 'Populates the database with the complete 3-month learning plan'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data population...')

        # Get or create admin user
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@focusflow.com',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        workspace = user.workspace
        self.stdout.write(f'Using workspace: {workspace.name}')

        # Create categories
        categories = self.create_categories(workspace)

        # Create tracks
        tracks = self.create_tracks(workspace, categories)

        # Create sprints and tasks for each track
        self.create_sprints_and_tasks(workspace, tracks)

        self.stdout.write(self.style.SUCCESS('Successfully populated learning plan!'))
        self.stdout.write(f'Total Tracks: {Track.objects.filter(workspace=workspace).count()}')
        self.stdout.write(f'Total Sprints: {Sprint.objects.filter(track__workspace=workspace).count()}')
        self.stdout.write(f'Total Tasks: {Task.objects.filter(workspace=workspace).count()}')

    def create_categories(self, workspace):
        """Create learning categories"""
        category_data = [
            {'name': 'Cloud & Infrastructure', 'description': 'AWS, Cloud Architecture, Infrastructure'},
            {'name': 'DevOps & Automation', 'description': 'Docker, Kubernetes, CI/CD, GitOps'},
            {'name': 'AI & Machine Learning', 'description': 'AI Engineering, LLMs, RAG, Embeddings'},
            {'name': 'Backend Development', 'description': 'Django, REST APIs, WebSockets'},
            {'name': 'Data Engineering', 'description': 'PySpark, ETL, Data Pipelines, Observability'},
            {'name': 'Trading & Finance', 'description': 'Stock Trading, Technical Analysis, Options'},
        ]

        categories = {}
        for cat_data in category_data:
            category, created = Category.objects.get_or_create(
                workspace=workspace,
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {cat_data["name"]}')

        return categories

    def create_tracks(self, workspace, categories):
        """Create main learning tracks"""
        base_date = datetime(2024, 12, 9).date()

        track_data = [
            {
                'title': 'AWS Solutions Architect Certification',
                'category': 'Cloud & Infrastructure',
                'description': 'Complete AWS SAA certification preparation covering all domains: design resilient architectures, high-performance systems, secure applications, and cost-optimized solutions.',
                'deadline': base_date + timedelta(days=112),  # Mar 31
                'is_active': True,
            },
            {
                'title': 'DevOps Engineering Mastery',
                'category': 'DevOps & Automation',
                'description': 'Master DevOps tools and practices: Linux, Docker, Kubernetes, Helm, Jenkins, GitLab CI/CD, ArgoCD, and production deployment strategies.',
                'deadline': base_date + timedelta(days=112),
                'is_active': True,
            },
            {
                'title': 'AI Engineering Foundations',
                'category': 'AI & Machine Learning',
                'description': 'Build production AI applications: OpenAI APIs, prompt engineering, embeddings, vector databases, RAG systems, and LangChain framework.',
                'deadline': base_date + timedelta(days=84),  # 12 weeks
                'is_active': True,
            },
            {
                'title': 'Backend Development with Django',
                'category': 'Backend Development',
                'description': 'Full-stack backend development: Django setup, ORM, Django REST Framework, authentication, WebSockets, real-time features, and production deployment.',
                'deadline': base_date + timedelta(days=84),
                'is_active': True,
            },
            {
                'title': 'Data Engineering & Observability',
                'category': 'Data Engineering',
                'description': 'Build scalable data systems: PySpark, dbt transformations, Prometheus monitoring, Grafana dashboards, ELK logging, OpenTelemetry tracing.',
                'deadline': base_date + timedelta(days=84),
                'is_active': True,
            },
            {
                'title': 'Trading & Market Analysis',
                'category': 'Trading & Finance',
                'description': 'Learn systematic trading: market fundamentals, technical analysis, candlestick patterns, indicators, fundamental analysis, futures, options, and strategies.',
                'deadline': base_date + timedelta(days=84),
                'is_active': True,
            },
        ]

        tracks = {}
        for track_info in track_data:
            category = categories[track_info['category']]
            track, created = Track.objects.get_or_create(
                workspace=workspace,
                title=track_info['title'],
                defaults={
                    'category': category,
                    'description': track_info['description'],
                    'deadline': track_info['deadline'],
                    'is_active': track_info['is_active'],
                }
            )
            tracks[track_info['title']] = track
            if created:
                self.stdout.write(f'Created track: {track_info["title"]}')

        return tracks

    def create_sprints_and_tasks(self, workspace, tracks):
        """Create sprints and tasks for each track"""
        base_date = datetime(2024, 12, 9).date()

        # AWS Track Sprints
        aws_track = tracks['AWS Solutions Architect Certification']
        self.create_aws_sprints(workspace, aws_track, base_date)

        # DevOps Track Sprints
        devops_track = tracks['DevOps Engineering Mastery']
        self.create_devops_sprints(workspace, devops_track, base_date)

        # AI Track Sprints
        ai_track = tracks['AI Engineering Foundations']
        self.create_ai_sprints(workspace, ai_track, base_date)

        # Backend Track Sprints
        backend_track = tracks['Backend Development with Django']
        self.create_backend_sprints(workspace, backend_track, base_date)

        # Data Engineering Track Sprints
        data_track = tracks['Data Engineering & Observability']
        self.create_data_sprints(workspace, data_track, base_date)

        # Trading Track Sprints
        trading_track = tracks['Trading & Market Analysis']
        self.create_trading_sprints(workspace, trading_track, base_date)

    def create_aws_sprints(self, workspace, track, base_date):
        """Create AWS sprints and tasks"""
        sprints_data = [
            {
                'name': 'Sprint 1: AWS Fundamentals',
                'start_date': base_date,
                'end_date': base_date + timedelta(days=13),
                'description': 'IAM, EC2, VPC, Storage basics',
                'tasks': [
                    'Setup AWS account and enable MFA',
                    'Master IAM: Users, Groups, Roles, Policies',
                    'Launch and configure EC2 instances',
                    'Configure Security Groups and Network ACLs',
                    'Create custom VPC with public/private subnets',
                    'Work with EBS volumes and snapshots',
                    'Implement S3 storage and lifecycle policies',
                ]
            },
            {
                'name': 'Sprint 2: Networking & Databases',
                'start_date': base_date + timedelta(days=14),
                'end_date': base_date + timedelta(days=27),
                'description': 'Advanced VPC, RDS, High Availability',
                'tasks': [
                    'Configure VPC peering and NAT Gateway',
                    'Deploy RDS with Multi-AZ',
                    'Setup RDS Read Replicas',
                    'Configure Auto Scaling Groups',
                    'Implement Application Load Balancer',
                    'Create EFS and mount across instances',
                ]
            },
            {
                'name': 'Sprint 3: Serverless & Advanced Services',
                'start_date': base_date + timedelta(days=28),
                'end_date': base_date + timedelta(days=41),
                'description': 'Lambda, API Gateway, DynamoDB',
                'tasks': [
                    'Build Lambda functions with Python',
                    'Create REST API with API Gateway',
                    'Design DynamoDB tables with GSI/LSI',
                    'Implement serverless CRUD application',
                    'Configure CloudFront distribution',
                    'Setup S3 static website hosting',
                ]
            },
            {
                'name': 'Sprint 4: Security & Monitoring',
                'start_date': base_date + timedelta(days=42),
                'end_date': base_date + timedelta(days=55),
                'description': 'KMS, CloudTrail, CloudWatch, WAF',
                'tasks': [
                    'Implement KMS encryption for services',
                    'Configure AWS Secrets Manager',
                    'Enable CloudTrail logging',
                    'Setup CloudWatch dashboards and alarms',
                    'Configure WAF rules',
                    'Implement security best practices',
                ]
            },
            {
                'name': 'Sprint 5: Well-Architected Framework',
                'start_date': base_date + timedelta(days=56),
                'end_date': base_date + timedelta(days=69),
                'description': 'Architecture patterns, best practices',
                'tasks': [
                    'Study 6 pillars of Well-Architected Framework',
                    'Design high-availability architectures',
                    'Implement disaster recovery strategies',
                    'Cost optimization techniques',
                    'Take practice exam #1',
                    'Review weak areas',
                ]
            },
            {
                'name': 'Sprint 6: Certification Prep',
                'start_date': base_date + timedelta(days=70),
                'end_date': base_date + timedelta(days=83),
                'description': 'Practice exams and final review',
                'tasks': [
                    'Complete practice exam #2',
                    'Complete practice exam #3',
                    'Review all AWS services and limits',
                    'Final exam strategies and tips',
                    'Schedule and take AWS SAA exam',
                ]
            },
        ]

        self.create_sprint_tasks(workspace, track, sprints_data, 'HIGH')

    def create_devops_sprints(self, workspace, track, base_date):
        """Create DevOps sprints and tasks"""
        sprints_data = [
            {
                'name': 'Sprint 1: Linux & Docker Basics',
                'start_date': base_date,
                'end_date': base_date + timedelta(days=13),
                'description': 'Linux fundamentals, Docker containers',
                'tasks': [
                    'Master Linux command line operations',
                    'Understand file permissions and user management',
                    'Write bash scripts for automation',
                    'Install Docker and understand architecture',
                    'Build custom Docker images',
                    'Use Docker Compose for multi-container apps',
                ]
            },
            {
                'name': 'Sprint 2: Kubernetes Fundamentals',
                'start_date': base_date + timedelta(days=14),
                'end_date': base_date + timedelta(days=27),
                'description': 'K8s architecture, Pods, Deployments',
                'tasks': [
                    'Setup local Kubernetes cluster (Minikube/kind)',
                    'Understand Kubernetes architecture',
                    'Create and manage Pods',
                    'Deploy applications with Deployments',
                    'Configure Services (ClusterIP, NodePort, LoadBalancer)',
                    'Implement ConfigMaps and Secrets',
                ]
            },
            {
                'name': 'Sprint 3: Advanced Kubernetes',
                'start_date': base_date + timedelta(days=28),
                'end_date': base_date + timedelta(days=41),
                'description': 'Ingress, Persistent Storage, StatefulSets',
                'tasks': [
                    'Setup Ingress controller',
                    'Configure Persistent Volumes and Claims',
                    'Deploy stateful applications with StatefulSets',
                    'Implement network policies',
                    'Configure RBAC for security',
                    'Use Custom Resource Definitions',
                ]
            },
            {
                'name': 'Sprint 4: Helm & Package Management',
                'start_date': base_date + timedelta(days=42),
                'end_date': base_date + timedelta(days=55),
                'description': 'Helm charts, templating',
                'tasks': [
                    'Install and configure Helm',
                    'Deploy apps using Helm charts',
                    'Create custom Helm charts',
                    'Understand Helm templating',
                    'Manage Helm releases',
                    'Package multi-tier applications',
                ]
            },
            {
                'name': 'Sprint 5: CI/CD with Jenkins',
                'start_date': base_date + timedelta(days=56),
                'end_date': base_date + timedelta(days=69),
                'description': 'Jenkins pipelines, automation',
                'tasks': [
                    'Setup Jenkins server',
                    'Create Jenkins pipelines (Declarative)',
                    'Integrate Docker in CI/CD',
                    'Deploy to Kubernetes from Jenkins',
                    'Implement multi-stage pipelines',
                    'Configure approval workflows',
                ]
            },
            {
                'name': 'Sprint 6: GitOps & Advanced CI/CD',
                'start_date': base_date + timedelta(days=70),
                'end_date': base_date + timedelta(days=83),
                'description': 'GitLab CI/CD, ArgoCD, GitOps',
                'tasks': [
                    'Setup GitLab CI/CD pipelines',
                    'Install and configure ArgoCD',
                    'Implement GitOps workflow',
                    'Multi-environment deployments (dev/staging/prod)',
                    'Build complete CI/CD capstone project',
                ]
            },
        ]

        self.create_sprint_tasks(workspace, track, sprints_data, 'HIGH')

    def create_ai_sprints(self, workspace, track, base_date):
        """Create AI Engineering sprints and tasks"""
        sprints_data = [
            {
                'name': 'Sprint 1: AI API Basics',
                'start_date': base_date,
                'end_date': base_date + timedelta(days=13),
                'description': 'OpenAI API, basic completions',
                'tasks': [
                    'Setup OpenAI API and get API keys',
                    'Make first API calls (text completion)',
                    'Build simple chatbot with Chat API',
                    'Understand tokens and pricing',
                    'Handle API errors and rate limits',
                ]
            },
            {
                'name': 'Sprint 2: Prompt Engineering',
                'start_date': base_date + timedelta(days=14),
                'end_date': base_date + timedelta(days=27),
                'description': 'Advanced prompting techniques',
                'tasks': [
                    'Master zero-shot and few-shot prompting',
                    'Implement Chain of Thought prompting',
                    'Use ReAct pattern for reasoning',
                    'Format outputs (JSON, structured data)',
                    'Build reasoning task solver',
                    'Prevent prompt injection attacks',
                ]
            },
            {
                'name': 'Sprint 3: Embeddings & Vector Search',
                'start_date': base_date + timedelta(days=28),
                'end_date': base_date + timedelta(days=41),
                'description': 'Vector databases, semantic search',
                'tasks': [
                    'Understand embeddings and vector representations',
                    'Use OpenAI Embeddings API',
                    'Setup vector database (ChromaDB/Pinecone)',
                    'Build semantic search system',
                    'Calculate cosine similarity',
                    'Store and query embeddings with metadata',
                ]
            },
            {
                'name': 'Sprint 4: RAG Systems',
                'start_date': base_date + timedelta(days=42),
                'end_date': base_date + timedelta(days=55),
                'description': 'Retrieval Augmented Generation',
                'tasks': [
                    'Understand RAG architecture',
                    'Implement document chunking strategies',
                    'Build basic RAG Q&A system',
                    'Optimize retrieval accuracy',
                    'Implement hybrid search (keyword + semantic)',
                    'Add reranking for better results',
                ]
            },
            {
                'name': 'Sprint 5: LangChain Framework',
                'start_date': base_date + timedelta(days=56),
                'end_date': base_date + timedelta(days=69),
                'description': 'LangChain, agents, tools',
                'tasks': [
                    'Setup LangChain framework',
                    'Build conversational chatbot with memory',
                    'Create AI agents with tools',
                    'Implement function calling',
                    'Use document loaders and splitters',
                ]
            },
            {
                'name': 'Sprint 6: Production AI Apps',
                'start_date': base_date + timedelta(days=70),
                'end_date': base_date + timedelta(days=83),
                'description': 'Multi-modal AI, deployment',
                'tasks': [
                    'Work with GPT-4 Vision for image understanding',
                    'Build multi-modal applications',
                    'Deploy AI app with FastAPI',
                    'Implement AI monitoring',
                    'Build complete RAG application capstone',
                ]
            },
        ]

        self.create_sprint_tasks(workspace, track, sprints_data, 'MEDIUM')

    def create_backend_sprints(self, workspace, track, base_date):
        """Create Backend Development sprints and tasks"""
        sprints_data = [
            {
                'name': 'Sprint 1: Django Basics',
                'start_date': base_date,
                'end_date': base_date + timedelta(days=13),
                'description': 'Django setup, models, ORM',
                'tasks': [
                    'Install Django and create project',
                    'Understand MTV architecture',
                    'Create Django models with relationships',
                    'Work with Django ORM and QuerySets',
                    'Create migrations and manage database',
                    'Use Django admin interface',
                ]
            },
            {
                'name': 'Sprint 2: Django REST Framework',
                'start_date': base_date + timedelta(days=14),
                'end_date': base_date + timedelta(days=27),
                'description': 'REST APIs, serializers',
                'tasks': [
                    'Install Django REST Framework',
                    'Create serializers for models',
                    'Build API views and ViewSets',
                    'Configure routers for automatic URLs',
                    'Implement CRUD operations',
                    'Test APIs with Postman/Thunder Client',
                ]
            },
            {
                'name': 'Sprint 3: Authentication & Security',
                'start_date': base_date + timedelta(days=28),
                'end_date': base_date + timedelta(days=41),
                'description': 'JWT, permissions, throttling',
                'tasks': [
                    'Setup JWT authentication',
                    'Implement user registration and login',
                    'Configure permission classes',
                    'Add object-level permissions',
                    'Implement rate limiting/throttling',
                    'Secure API endpoints',
                ]
            },
            {
                'name': 'Sprint 4: WebSockets & Real-time',
                'start_date': base_date + timedelta(days=42),
                'end_date': base_date + timedelta(days=55),
                'description': 'Django Channels, WebSockets',
                'tasks': [
                    'Install Django Channels',
                    'Configure ASGI and Redis',
                    'Create WebSocket consumers',
                    'Build real-time chat application',
                    'Implement presence detection',
                    'Add WebSocket authentication',
                ]
            },
            {
                'name': 'Sprint 5: Performance & Testing',
                'start_date': base_date + timedelta(days=56),
                'end_date': base_date + timedelta(days=69),
                'description': 'Optimization, caching, tests',
                'tasks': [
                    'Optimize database queries',
                    'Implement Redis caching',
                    'Add database indexing',
                    'Write unit and integration tests',
                    'Test WebSocket connections',
                    'Achieve 80%+ code coverage',
                ]
            },
            {
                'name': 'Sprint 6: Production Deployment',
                'start_date': base_date + timedelta(days=70),
                'end_date': base_date + timedelta(days=83),
                'description': 'Production setup, deployment',
                'tasks': [
                    'Configure production settings',
                    'Setup Gunicorn/Uvicorn',
                    'Configure Nginx reverse proxy',
                    'Implement static file serving',
                    'Deploy to production server',
                    'Setup monitoring and logging',
                ]
            },
        ]

        self.create_sprint_tasks(workspace, track, sprints_data, 'MEDIUM')

    def create_data_sprints(self, workspace, track, base_date):
        """Create Data Engineering sprints and tasks"""
        sprints_data = [
            {
                'name': 'Sprint 1: PySpark Basics',
                'start_date': base_date,
                'end_date': base_date + timedelta(days=13),
                'description': 'Spark setup, DataFrames',
                'tasks': [
                    'Install Apache Spark and PySpark',
                    'Create SparkSession and run first program',
                    'Work with DataFrames (select, filter, where)',
                    'Perform aggregations and groupBy',
                    'Implement join operations',
                    'Handle null values and data cleaning',
                ]
            },
            {
                'name': 'Sprint 2: dbt Transformations',
                'start_date': base_date + timedelta(days=14),
                'end_date': base_date + timedelta(days=27),
                'description': 'dbt models, testing',
                'tasks': [
                    'Setup dbt project',
                    'Create dbt models (staging, intermediate, marts)',
                    'Use Jinja templating and macros',
                    'Implement different materializations',
                    'Write dbt tests for data quality',
                    'Generate documentation with dbt docs',
                ]
            },
            {
                'name': 'Sprint 3: Metrics with Prometheus',
                'start_date': base_date + timedelta(days=28),
                'end_date': base_date + timedelta(days=41),
                'description': 'Monitoring, metrics collection',
                'tasks': [
                    'Install and configure Prometheus',
                    'Understand metrics types (Counter, Gauge, etc)',
                    'Setup Grafana dashboards',
                    'Write PromQL queries',
                    'Create monitoring dashboards',
                    'Configure alerting rules',
                ]
            },
            {
                'name': 'Sprint 4: ELK Stack Logging',
                'start_date': base_date + timedelta(days=42),
                'end_date': base_date + timedelta(days=55),
                'description': 'Elasticsearch, Logstash, Kibana',
                'tasks': [
                    'Install Elasticsearch',
                    'Setup Logstash pipelines',
                    'Parse logs with Grok patterns',
                    'Install Kibana and create visualizations',
                    'Build log analysis dashboards',
                    'Query logs with Elasticsearch DSL',
                ]
            },
            {
                'name': 'Sprint 5: Distributed Tracing',
                'start_date': base_date + timedelta(days=56),
                'end_date': base_date + timedelta(days=69),
                'description': 'OpenTelemetry, tracing',
                'tasks': [
                    'Understand distributed tracing concepts',
                    'Install OpenTelemetry SDK',
                    'Instrument Python applications',
                    'Collect traces, metrics, and logs',
                    'Setup Jaeger for trace visualization',
                    'Implement complete observability',
                ]
            },
            {
                'name': 'Sprint 6: Data Lineage',
                'start_date': base_date + timedelta(days=70),
                'end_date': base_date + timedelta(days=83),
                'description': 'Data lineage, end-to-end pipeline',
                'tasks': [
                    'Understand data lineage concepts',
                    'Track data transformations',
                    'Build complete ETL pipeline',
                    'Add monitoring to data pipeline',
                    'Implement data quality checks',
                    'Build data platform capstone project',
                ]
            },
        ]

        self.create_sprint_tasks(workspace, track, sprints_data, 'MEDIUM')

    def create_trading_sprints(self, workspace, track, base_date):
        """Create Trading sprints and tasks"""
        sprints_data = [
            {
                'name': 'Sprint 1: Market Fundamentals',
                'start_date': base_date,
                'end_date': base_date + timedelta(days=13),
                'description': 'Stock market basics, candlesticks',
                'tasks': [
                    'Study stock market introduction (Varsity Module 1)',
                    'Understand market participants and structure',
                    'Learn candlestick patterns (Doji, Hammer, Engulfing)',
                    'Identify single and multi-candle patterns',
                    'Practice pattern recognition on charts',
                    'Understand support and resistance',
                ]
            },
            {
                'name': 'Sprint 2: Technical Indicators',
                'start_date': base_date + timedelta(days=14),
                'end_date': base_date + timedelta(days=27),
                'description': 'Moving averages, RSI, indicators',
                'tasks': [
                    'Learn Simple and Exponential Moving Averages',
                    'Identify MA crossovers (Golden/Death Cross)',
                    'Study RSI and momentum indicators',
                    'Understand overbought/oversold conditions',
                    'Practice indicator-based analysis',
                    'Combine multiple indicators',
                ]
            },
            {
                'name': 'Sprint 3: Fundamental Analysis',
                'start_date': base_date + timedelta(days=28),
                'end_date': base_date + timedelta(days=41),
                'description': 'Financial statements, ratios',
                'tasks': [
                    'Read Balance Sheet, P&L, Cash Flow',
                    'Calculate profitability ratios (ROE, ROA)',
                    'Analyze liquidity ratios',
                    'Study valuation ratios (P/E, P/B)',
                    'Evaluate company financial health',
                    'Analyze real company financials',
                ]
            },
            {
                'name': 'Sprint 4: Futures Trading',
                'start_date': base_date + timedelta(days=42),
                'end_date': base_date + timedelta(days=55),
                'description': 'Futures contracts, hedging',
                'tasks': [
                    'Understand futures contracts',
                    'Learn futures terminology',
                    'Calculate margin requirements',
                    'Understand Mark-to-Market',
                    'Study hedging strategies',
                    'Practice futures P&L calculations',
                ]
            },
            {
                'name': 'Sprint 5: Options Basics',
                'start_date': base_date + timedelta(days=56),
                'end_date': base_date + timedelta(days=69),
                'description': 'Options theory, Greeks',
                'tasks': [
                    'Learn Call and Put options',
                    'Understand options terminology',
                    'Study moneyness (ITM, ATM, OTM)',
                    'Learn Option Greeks (Delta, Gamma, Theta, Vega)',
                    'Calculate options payoffs',
                    'Analyze risk with Greeks',
                ]
            },
            {
                'name': 'Sprint 6: Option Strategies',
                'start_date': base_date + timedelta(days=70),
                'end_date': base_date + timedelta(days=83),
                'description': 'Spreads, advanced strategies',
                'tasks': [
                    'Learn Bull Call and Bear Put spreads',
                    'Study Iron Condor strategy',
                    'Understand Butterfly spreads',
                    'Draw payoff diagrams',
                    'Practice strategy backtesting',
                    'Build trading strategy with Python',
                ]
            },
        ]

        self.create_sprint_tasks(workspace, track, sprints_data, 'LOW')

    def create_sprint_tasks(self, workspace, track, sprints_data, default_priority):
        """Helper method to create sprints and their tasks"""
        for sprint_data in sprints_data:
            sprint, created = Sprint.objects.get_or_create(
                track=track,
                name=sprint_data['name'],
                defaults={
                    'start_date': sprint_data['start_date'],
                    'end_date': sprint_data['end_date'],
                    'description': sprint_data['description'],
                    'is_active': True,
                }
            )

            if created:
                self.stdout.write(f'  Created sprint: {sprint_data["name"]}')

            # Create tasks for this sprint
            for task_title in sprint_data['tasks']:
                task, task_created = Task.objects.get_or_create(
                    workspace=workspace,
                    track=track,
                    sprint=sprint,
                    title=task_title,
                    defaults={
                        'status': 'TODO',
                        'priority': default_priority,
                        'estimated_hours': 3.0,
                    }
                )
                if task_created:
                    self.stdout.write(f'    Created task: {task_title[:50]}...')
