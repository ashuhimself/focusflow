"""
Django REST Framework serializers for FocusFlow core models.
Production-grade serializers with validation and nested relationships.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Workspace, Track, Sprint, Task, DailyLog, Category, DailyTodo


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with basic profile info."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class WorkspaceSerializer(serializers.ModelSerializer):
    """Serializer for Workspace model."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Workspace
        fields = ['user', 'name', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class TrackSerializer(serializers.ModelSerializer):
    """Serializer for Track model with auto-calculated fields."""
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    task_count = serializers.SerializerMethodField()
    sprint_count = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            'id', 'workspace', 'title', 'description', 'category', 'category_name',
            'progress_percentage', 'deadline', 'is_active', 'task_count', 'sprint_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'workspace', 'progress_percentage', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        """Return total number of tasks for this track."""
        return obj.tasks.count()

    def get_sprint_count(self, obj):
        """Return total number of sprints for this track."""
        return obj.sprints.count()

    def validate_deadline(self, value):
        """Ensure deadline is not in the past."""
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value


class TrackDetailSerializer(TrackSerializer):
    """Detailed Track serializer with nested tasks and sprints."""
    tasks = serializers.SerializerMethodField()
    sprints = serializers.SerializerMethodField()

    class Meta(TrackSerializer.Meta):
        fields = TrackSerializer.Meta.fields + ['tasks', 'sprints']

    def get_tasks(self, obj):
        """Return recent tasks for this track."""
        tasks = obj.tasks.all()[:10]  # Limit to prevent large payloads
        return TaskSerializer(tasks, many=True).data

    def get_sprints(self, obj):
        """Return recent sprints for this track."""
        sprints = obj.sprints.all()[:5]  # Limit to prevent large payloads
        return SprintSerializer(sprints, many=True).data


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    track_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'workspace', 'name', 'description', 'track_count', 'created_at']
        read_only_fields = ['id', 'workspace', 'created_at']

    def get_track_count(self, obj):
        """Return total number of tracks for this category."""
        return obj.tracks.count()

    def get_sprints(self, obj):
        """Return recent sprints for this goal."""
        sprints = obj.sprints.all()[:5]
        return SprintSerializer(sprints, many=True).data


class SprintSerializer(serializers.ModelSerializer):
    """Serializer for Sprint model with validation."""
    track = serializers.PrimaryKeyRelatedField(queryset=Track.objects.all())
    track_title = serializers.CharField(source='track.title', read_only=True)
    duration_days = serializers.ReadOnlyField()
    is_current = serializers.ReadOnlyField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Sprint
        fields = [
            'id', 'track', 'track_title', 'name', 'start_date', 'end_date',
            'description', 'is_active', 'duration_days', 'is_current',
            'task_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        """Return total number of tasks in this sprint."""
        return obj.tasks.count()

    def validate(self, attrs):
        """Ensure end_date is after start_date."""
        if attrs.get('end_date') and attrs.get('start_date'):
            if attrs['end_date'] < attrs['start_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date."
                })
        return attrs

    def validate_track(self, value):
        """Ensure track belongs to user's workspace."""
        request = self.context.get('request')
        if request and hasattr(request.user, 'workspace'):
            if value.workspace != request.user.workspace:
                raise serializers.ValidationError("Track does not belong to your workspace.")
        return value


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model with validation and display fields."""
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    track = serializers.PrimaryKeyRelatedField(
        queryset=Track.objects.all(),
        required=False,
        allow_null=True
    )
    sprint = serializers.PrimaryKeyRelatedField(
        queryset=Sprint.objects.all(),
        required=False,
        allow_null=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    track_title = serializers.CharField(source='track.title', read_only=True)
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    remind_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = [
            'id', 'workspace', 'track', 'track_title', 'sprint', 'sprint_name',
            'title', 'description', 'status', 'status_display',
            'priority', 'priority_display', 'estimated_hours', 'actual_hours',
            'due_date', 'remind_at', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'workspace', 'completed_at', 'created_at', 'updated_at']

    def validate_track(self, value):
        """Ensure track belongs to user's workspace."""
        if value:
            request = self.context.get('request')
            if request and hasattr(request.user, 'workspace'):
                if value.workspace != request.user.workspace:
                    raise serializers.ValidationError("Track does not belong to your workspace.")
        return value

    def validate_sprint(self, value):
        """Ensure sprint belongs to the same track."""
        if value:
            track = self.initial_data.get('track') or (self.instance.track if self.instance else None)
            if track and value.track.id != (track.id if hasattr(track, 'id') else track):
                raise serializers.ValidationError("Sprint must belong to the selected track.")
        return value

    def validate(self, attrs):
        """Additional validation for task fields."""
        # Validate due_date
        if attrs.get('due_date'):
            from django.utils import timezone
            if attrs['due_date'] < timezone.now().date():
                raise serializers.ValidationError({
                    "due_date": "Due date cannot be in the past."
                })

        # Validate estimated vs actual hours
        if attrs.get('actual_hours') and attrs.get('estimated_hours'):
            if attrs['actual_hours'] < 0 or attrs['estimated_hours'] < 0:
                raise serializers.ValidationError({
                    "hours": "Hours cannot be negative."
                })

        return attrs


class DailyLogSerializer(serializers.ModelSerializer):
    """Serializer for DailyLog model with validation."""
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DailyLog
        fields = [
            'id', 'workspace', 'date', 'mood_score', 'notes',
            'habits_completed', 'energy_level', 'focus_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'workspace', 'created_at', 'updated_at']

    def validate_date(self, value):
        """Prevent creating logs for future dates."""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot create logs for future dates.")
        return value

    def validate(self, attrs):
        """Ensure unique daily log per workspace per date."""
        request = self.context.get('request')
        if request and hasattr(request.user, 'workspace'):
            workspace = request.user.workspace
            date = attrs.get('date')

            # Check for existing log (exclude current instance if updating)
            existing_log = DailyLog.objects.filter(
                workspace=workspace,
                date=date
            )
            if self.instance:
                existing_log = existing_log.exclude(id=self.instance.id)

            if existing_log.exists():
                raise serializers.ValidationError({
                    "date": "A log for this date already exists."
                })

        return attrs


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics (read-only)."""
    total_tracks = serializers.IntegerField()
    active_tracks = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    active_sprints = serializers.IntegerField()
    avg_mood_score = serializers.FloatField()
    total_focus_hours = serializers.FloatField()
    completion_rate = serializers.FloatField()
    pending_todos = serializers.IntegerField()
    greeting = serializers.CharField()
    heatmap_data = serializers.ListField()
    sprint_progress = serializers.ListField()
    high_priority_pending = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()


class DailyTodoSerializer(serializers.ModelSerializer):
    """Serializer for DailyTodo model."""
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DailyTodo
        fields = [
            'id', 'workspace', 'title', 'description', 'is_completed',
            'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'workspace', 'created_at', 'updated_at']
