#!/bin/bash

# FocusFlow Production Management Script
# Helper script for common production operations

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

COMPOSE_CMD="docker-compose -f docker-compose.prod.yml --env-file .env.production"

function show_help() {
    echo "FocusFlow Production Management"
    echo ""
    echo "Usage: ./manage-prod.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs        - View logs (follow mode)"
    echo "  status      - Show status of all containers"
    echo "  shell       - Open Django shell"
    echo "  migrate     - Run database migrations"
    echo "  static      - Collect static files"
    echo "  backup      - Backup database"
    echo "  restore     - Restore database from backup"
    echo "  clean       - Clean up Docker resources"
    echo "  update      - Pull latest code and redeploy"
    echo ""
}

function start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    $COMPOSE_CMD up -d
    echo -e "${GREEN}Services started ✓${NC}"
}

function stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    $COMPOSE_CMD down
    echo -e "${GREEN}Services stopped ✓${NC}"
}

function restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    $COMPOSE_CMD restart
    echo -e "${GREEN}Services restarted ✓${NC}"
}

function view_logs() {
    echo -e "${YELLOW}Viewing logs (Ctrl+C to exit)...${NC}"
    $COMPOSE_CMD logs -f
}

function show_status() {
    echo -e "${YELLOW}Container Status:${NC}"
    $COMPOSE_CMD ps
}

function open_shell() {
    echo -e "${YELLOW}Opening Django shell...${NC}"
    $COMPOSE_CMD exec backend python manage.py shell
}

function run_migrations() {
    echo -e "${YELLOW}Running migrations...${NC}"
    $COMPOSE_CMD exec backend python manage.py migrate
    echo -e "${GREEN}Migrations completed ✓${NC}"
}

function collect_static() {
    echo -e "${YELLOW}Collecting static files...${NC}"
    $COMPOSE_CMD exec backend python manage.py collectstatic --noinput
    echo -e "${GREEN}Static files collected ✓${NC}"
}

function backup_db() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${YELLOW}Creating database backup: $BACKUP_FILE${NC}"
    $COMPOSE_CMD exec -T db pg_dump -U focusflow focusflow > "$BACKUP_FILE"
    echo -e "${GREEN}Backup created: $BACKUP_FILE ✓${NC}"
}

function restore_db() {
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh backup_*.sql 2>/dev/null || echo "No backups found"
    echo ""
    read -p "Enter backup filename to restore: " BACKUP_FILE

    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi

    echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Restoring database from $BACKUP_FILE...${NC}"
        cat "$BACKUP_FILE" | $COMPOSE_CMD exec -T db psql -U focusflow focusflow
        echo -e "${GREEN}Database restored ✓${NC}"
    else
        echo "Restore cancelled"
    fi
}

function clean_docker() {
    echo -e "${YELLOW}Cleaning Docker resources...${NC}"
    read -p "This will remove unused images and containers. Continue? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        docker system prune -a
        echo -e "${GREEN}Docker cleanup completed ✓${NC}"
    else
        echo "Cleanup cancelled"
    fi
}

function update_app() {
    echo -e "${YELLOW}Updating application...${NC}"

    if [ -d .git ]; then
        git pull origin main
    else
        echo -e "${RED}Not a git repository${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Rebuilding and restarting...${NC}"
    ./deploy.sh
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        view_logs
        ;;
    status)
        show_status
        ;;
    shell)
        open_shell
        ;;
    migrate)
        run_migrations
        ;;
    static)
        collect_static
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db
        ;;
    clean)
        clean_docker
        ;;
    update)
        update_app
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
