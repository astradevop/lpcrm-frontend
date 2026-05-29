import React, { useMemo } from 'react';
import { Clock, CheckCircle, CalendarClock, Users, Activity, FileText } from 'lucide-react';

const UnifiedTimeline = ({ followUps = [], processingTimeline = [], assignmentHistory = [] }) => {
  const events = useMemo(() => {
    const allEvents = [];

    // Follow-ups
    followUps.forEach((f) => {
      allEvents.push({
        id: `fu-${f.id}`,
        type: 'follow_up',
        title: 'Follow-Up Scheduled',
        description: `Scheduled for ${f.follow_up_date} ${f.follow_up_time || ''}`,
        timestamp: f.created_at || f.follow_up_date,
        meta: f.status,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        Icon: CalendarClock
      });
    });

    // Processing Timeline
    processingTimeline.forEach((p) => {
      allEvents.push({
        id: `pt-${p.id}`,
        type: 'processing',
        title: `Status Changed to ${p.status?.replace('_', ' ')}`,
        description: p.notes || '',
        timestamp: p.timestamp,
        meta: p.changed_by ? `${p.changed_by.first_name} ${p.changed_by.last_name}` : 'System',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        Icon: Activity
      });
    });

    // Assignment History
    assignmentHistory.forEach((a) => {
      allEvents.push({
        id: `ah-${a.id}`,
        type: 'assignment',
        title: `Lead Assigned (${a.assignment_type})`,
        description: `Assigned to ${a.assigned_to?.first_name || 'System'}`,
        timestamp: a.timestamp,
        meta: a.notes || '',
        color: 'text-indigo-600',
        bg: 'bg-indigo-100',
        Icon: Users
      });
    });

    // Sort descending by timestamp
    return allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [followUps, processingTimeline, assignmentHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No timeline events available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Clock size={20} className="text-indigo-600" />
        Unified Timeline
      </h3>

      <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-6">
            <div className={`absolute -left-3.5 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${event.bg} ${event.color}`}>
              <event.Icon size={12} />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-gray-900">{event.title}</h4>
                <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                  {formatDate(event.timestamp)}
                </span>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
              )}
              
              {event.meta && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white inline-flex px-2 py-1 rounded-md border border-gray-100">
                  <FileText size={12} />
                  {event.meta}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UnifiedTimeline);
