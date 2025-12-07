/**
 * Heatmap Component - GitHub-style contribution graph
 */
const Heatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted">
        No activity data available
      </div>
    );
  }

  const getColorByLevel = (level) => {
    const colors = [
      'bg-dark-elevated',      // 0 tasks
      'bg-primary bg-opacity-20',  // 1 task
      'bg-primary bg-opacity-40',  // 2 tasks
      'bg-primary bg-opacity-60',  // 3 tasks
      'bg-primary bg-opacity-80',  // 4+ tasks
    ];
    return colors[level] || colors[0];
  };

  // Group by weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getColorByLevel(level)}`}
            ></div>
          ))}
        </div>
        <span>More</span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${getColorByLevel(day.level)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                title={`${day.date}: ${day.count} tasks completed`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
