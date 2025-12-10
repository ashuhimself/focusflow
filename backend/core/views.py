"""
Django REST Framework views for FocusFlow.
Production-grade viewsets with proper filtering, permissions, and pagination.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Count, Q, Avg, Sum
from django.utils import timezone
from datetime import timedelta

from .models import Workspace, Track, Sprint, Task, DailyLog, Category, DailyTodo
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    WorkspaceSerializer,
    TrackSerializer,
    TrackDetailSerializer,
    SprintSerializer,
    TaskSerializer,
    DailyLogSerializer,
    DashboardStatsSerializer,
    CategorySerializer,
    DailyTodoSerializer,
)
from .permissions import BelongsToUserWorkspace


class WorkspaceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing workspace.
    Users can only view their own workspace (read-only).
    """
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]

    def get_queryset(self):
        """Return only the user's workspace."""
        return Workspace.objects.filter(user=self.request.user)


class TrackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Tracks.
    Full CRUD operations with workspace isolation.
    """
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'deadline', 'progress_percentage', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only tracks from user's workspace."""
        workspace = self.request.user.workspace
        queryset = Track.objects.filter(workspace=workspace)

        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action."""
        if self.action == 'retrieve':
            return TrackDetailSerializer
        return TrackSerializer

    def perform_create(self, serializer):
        """Set workspace to current user's workspace."""
        serializer.save(workspace=self.request.user.workspace)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Manually trigger progress update based on tasks."""
        track = self.get_object()
        track.update_progress()
        serializer = self.get_serializer(track)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get tracks grouped by category."""
        workspace = request.user.workspace
        categories = Category.objects.filter(workspace=workspace)

        result = []
        for category in categories:
            tracks = Track.objects.filter(
                workspace=workspace,
                category=category,
                is_active=True
            )
            if tracks.exists():
                result.append({
                    'category': CategorySerializer(category).data,
                    'tracks': TrackSerializer(tracks, many=True).data
                })

        return Response(result)


class SprintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Sprints.
    Full CRUD operations with workspace isolation via track.
    """
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        """Return only sprints from user's workspace tracks."""
        workspace = self.request.user.workspace
        queryset = Sprint.objects.filter(track__workspace=workspace)

        # Filter by track
        track_id = self.request.query_params.get('track', None)
        if track_id:
            queryset = queryset.filter(track_id=track_id)

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Filter current sprints
        is_current = self.request.query_params.get('is_current', None)
        if is_current == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(start_date__lte=today, end_date__gte=today)

        return queryset

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get all currently active sprints."""
        today = timezone.now().date()
        workspace = request.user.workspace
        sprints = Sprint.objects.filter(
            track__workspace=workspace,
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        )
        serializer = self.get_serializer(sprints, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Categories.
    Full CRUD operations with workspace isolation.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Return only categories from user's workspace."""
        workspace = self.request.user.workspace
        return Category.objects.filter(workspace=workspace)

    def perform_create(self, serializer):
        """Set workspace to current user's workspace."""
        serializer.save(workspace=self.request.user.workspace)


class DailyTodoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Daily Todos.
    Full CRUD operations with workspace isolation.
    """
    serializer_class = DailyTodoSerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'date']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only daily todos from user's workspace."""
        workspace = self.request.user.workspace
        queryset = DailyTodo.objects.filter(workspace=workspace)

        # Filter by date
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)

        # Filter by completion status
        is_completed = self.request.query_params.get('is_completed', None)
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == 'true')

        return queryset

    def perform_create(self, serializer):
        """Set workspace to current user's workspace."""
        serializer.save(workspace=self.request.user.workspace)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's todos, create if none exist."""
        workspace = request.user.workspace
        today = timezone.now().date()

        todos = DailyTodo.objects.filter(workspace=workspace, date=today)
        if not todos.exists():
            # Create default todos for today
            default_todos = [
                "Review daily goals",
                "Check task progress",
                "Update sprint status",
                "Plan tomorrow's priorities"
            ]
            for title in default_todos:
                DailyTodo.objects.create(
                    workspace=workspace,
                    title=title,
                    date=today
                )
            todos = DailyTodo.objects.filter(workspace=workspace, date=today)

        serializer = self.get_serializer(todos, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Tasks.
    Full CRUD operations with workspace isolation.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']
    ordering = ['-priority', '-created_at']

    def get_queryset(self):
        """Return only tasks from user's workspace."""
        workspace = self.request.user.workspace
        queryset = Task.objects.filter(workspace=workspace)

        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority.upper())

        # Filter by track
        track_id = self.request.query_params.get('track', None)
        if track_id:
            queryset = queryset.filter(track_id=track_id)

        # Filter by sprint
        sprint_id = self.request.query_params.get('sprint', None)
        if sprint_id:
            queryset = queryset.filter(sprint_id=sprint_id)

        # Filter overdue tasks
        is_overdue = self.request.query_params.get('is_overdue', None)
        if is_overdue == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                due_date__lt=today,
                status__in=[Task.StatusChoices.TODO, Task.StatusChoices.IN_PROGRESS]
            )

        return queryset

    def perform_create(self, serializer):
        """Set workspace to current user's workspace."""
        serializer.save(workspace=self.request.user.workspace)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get tasks grouped by status."""
        workspace = request.user.workspace
        statuses = Task.StatusChoices.choices

        result = {}
        for status_code, status_name in statuses:
            tasks = Task.objects.filter(
                workspace=workspace,
                status=status_code
            )
            result[status_code] = {
                'name': status_name,
                'count': tasks.count(),
                'tasks': TaskSerializer(tasks[:20], many=True).data  # Limit to 20
            }

        return Response(result)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get tasks due today."""
        today = timezone.now().date()
        workspace = request.user.workspace
        tasks = Task.objects.filter(
            workspace=workspace,
            due_date=today,
            status__in=[Task.StatusChoices.TODO, Task.StatusChoices.IN_PROGRESS]
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)


class DailyLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Daily Logs.
    Full CRUD operations with workspace isolation.
    """
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated, BelongsToUserWorkspace]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'mood_score', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        """Return only daily logs from user's workspace."""
        workspace = self.request.user.workspace
        queryset = DailyLog.objects.filter(workspace=workspace)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        """Set workspace to current user's workspace."""
        serializer.save(workspace=self.request.user.workspace)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get or create today's log."""
        today = timezone.now().date()
        workspace = request.user.workspace

        log, created = DailyLog.objects.get_or_create(
            workspace=workspace,
            date=today
        )

        serializer = self.get_serializer(log)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get logs from the last 7 days."""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        workspace = request.user.workspace

        logs = DailyLog.objects.filter(
            workspace=workspace,
            date__gte=start_date,
            date__lte=end_date
        )

        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for the user's workspace.
    Includes pending tasks, sprint progress, and heatmap data.
    """
    workspace = request.user.workspace
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)

    # Track stats
    tracks = Track.objects.filter(workspace=workspace)
    total_tracks = tracks.count()
    active_tracks = tracks.filter(is_active=True).count()

    # Task stats
    tasks = Task.objects.filter(workspace=workspace)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status=Task.StatusChoices.DONE).count()
    in_progress_tasks = tasks.filter(status=Task.StatusChoices.IN_PROGRESS).count()
    pending_tasks = tasks.filter(status=Task.StatusChoices.TODO).count()

    # High priority pending tasks
    high_priority_pending = tasks.filter(
        status__in=[Task.StatusChoices.TODO, Task.StatusChoices.IN_PROGRESS],
        priority=Task.PriorityChoices.HIGH
    ).count()

    # Overdue tasks
    overdue_tasks = tasks.filter(
        status__in=[Task.StatusChoices.TODO, Task.StatusChoices.IN_PROGRESS],
        due_date__lt=today
    ).count()

    # Current active sprint progress
    active_sprints = Sprint.objects.filter(
        track__workspace=workspace,
        start_date__lte=today,
        end_date__gte=today,
        is_active=True
    )

    sprint_progress = []
    for sprint in active_sprints:
        sprint_tasks = Task.objects.filter(sprint=sprint)
        total_sprint_tasks = sprint_tasks.count()
        completed_sprint_tasks = sprint_tasks.filter(status=Task.StatusChoices.DONE).count()

        progress_percentage = (completed_sprint_tasks / total_sprint_tasks * 100) if total_sprint_tasks > 0 else 0

        sprint_progress.append({
            'id': sprint.id,
            'name': sprint.name,
            'track_title': sprint.track.title if sprint.track else None,
            'start_date': sprint.start_date,
            'end_date': sprint.end_date,
            'total_tasks': total_sprint_tasks,
            'completed_tasks': completed_sprint_tasks,
            'progress_percentage': round(progress_percentage, 2),
            'days_remaining': (sprint.end_date - today).days,
        })

    # Heatmap data: Last 30 days of task completion
    heatmap_data = []
    for i in range(30):
        date = today - timedelta(days=i)
        completed_on_date = Task.objects.filter(
            workspace=workspace,
            completed_at__date=date
        ).count()

        heatmap_data.append({
            'date': date.isoformat(),
            'count': completed_on_date,
            'level': min(completed_on_date, 4)  # 0-4 for visual intensity
        })

    # Reverse to get chronological order
    heatmap_data.reverse()

    # Daily log stats (last 30 days)
    recent_logs = DailyLog.objects.filter(
        workspace=workspace,
        date__gte=thirty_days_ago
    )

    avg_mood = recent_logs.aggregate(avg_mood=Avg('mood_score'))['avg_mood'] or 0
    total_focus = recent_logs.aggregate(total_focus=Sum('focus_hours'))['total_focus'] or 0

    # Completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # User greeting based on time of day
    from datetime import datetime
    current_hour = datetime.now().hour
    if current_hour < 12:
        greeting = "Good morning"
    elif current_hour < 18:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    stats = {
        'greeting': greeting,
        'user_name': request.user.first_name or request.user.username,
        'total_tracks': total_tracks,
        'active_tracks': active_tracks,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'pending_tasks': pending_tasks,
        'high_priority_pending': high_priority_pending,
        'overdue_tasks': overdue_tasks,
        'active_sprints_count': active_sprints.count(),
        'sprint_progress': sprint_progress,
        'heatmap_data': heatmap_data,
        'avg_mood_score': round(avg_mood, 2),
        'total_focus_hours': round(total_focus, 2),
        'completion_rate': round(completion_rate, 2),
    }

    return Response(stats)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user and automatically create their workspace.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response({
            'user': user_data,
            'message': 'Registration successful! Your account is pending admin approval. You will be notified once approved.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user's profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_token_obtain(request):
    """
    Custom token obtain view that checks if user is approved before issuing tokens.
    """
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.contrib.auth import authenticate

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'detail': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Check if user has a profile and is approved
    try:
        profile = user.profile
        if not profile.is_approved:
            return Response(
                {'detail': 'Your account is pending admin approval. Please wait for approval before logging in.'},
                status=status.HTTP_403_FORBIDDEN
            )
    except:
        # If no profile exists (shouldn't happen), deny access
        return Response(
            {'detail': 'User profile not found. Please contact support.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # User is approved, issue tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Request a password reset email.
    Generates a token and sends email with reset link.
    """
    from django.contrib.auth.tokens import default_token_generator
    from django.core.mail import send_mail
    from django.template.loader import render_to_string
    from django.conf import settings

    email = request.data.get('email')

    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Return success even if user doesn't exist (security best practice)
        return Response(
            {'message': 'If an account exists with this email, you will receive password reset instructions.'},
            status=status.HTTP_200_OK
        )

    # Generate reset token
    token = default_token_generator.make_token(user)

    # Create reset URL
    frontend_url = settings.FRONTEND_URL
    reset_url = f"{frontend_url}/reset-password?token={token}&uid={user.pk}"

    # Send email with HTML template
    try:
        subject = 'Reset Your BreathingMonk Password'

        # Render HTML email
        html_message = render_to_string('emails/password_reset.html', {
            'username': user.username,
            'reset_url': reset_url,
        })

        # Plain text fallback
        plain_message = f'''
        Hello {user.username},

        We received a request to reset your password for your BreathingMonk account.

        Click the link below to reset your password:
        {reset_url}

        This link will expire in 24 hours.

        If you didn't request a password reset, you can safely ignore this email.

        Best regards,
        The BreathingMonk Team
        '''

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )

        print(f"Password reset email sent to {email}")

    except Exception as e:
        print(f"Error sending password reset email: {e}")
        # Don't reveal to user whether email exists or if there was an error

    return Response(
        {'message': 'If an account exists with this email, you will receive password reset instructions.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Confirm password reset with token and set new password.
    """
    from django.contrib.auth.tokens import default_token_generator

    token = request.data.get('token')
    password = request.data.get('password')
    uid = request.data.get('uid')

    if not all([token, password, uid]):
        return Response(
            {'error': 'Token, password, and user ID are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(pk=uid)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify token
    if not default_token_generator.check_token(user, token):
        return Response(
            {'error': 'Invalid or expired reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set new password
    user.set_password(password)
    user.save()

    return Response(
        {'message': 'Password has been reset successfully'},
        status=status.HTTP_200_OK
    )
