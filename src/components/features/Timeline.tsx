'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Calendar, Download } from '@/components/icons';
import type { TimelineEvent } from '@/types';

type ExportFormat = 'csv' | 'json' | 'txt' | 'pdf';

// Export functions
function exportToCSV(events: TimelineEvent[], filename: string) {
  if (events.length === 0) return;
  
  const csvContent = [
    'Date,Title,Description,Chapter',
    ...events.map(event => {
      const date = event.date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const title = `"${event.title.replace(/"/g, '""')}"`;
      const description = `"${event.description.replace(/"/g, '""')}"`;
      const chapter = event.chapter;
      return `${date},${title},${description},${chapter}`;
    })
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

function exportToJSON(events: TimelineEvent[], filename: string) {
  const jsonContent = JSON.stringify(
    events.map(event => ({
      id: event.id,
      date: event.date.toISOString(),
      title: event.title,
      description: event.description,
      chapter: event.chapter,
      sourceEntryId: event.sourceEntryId
    })),
    null,
    2
  );
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
}

function exportToTXT(events: TimelineEvent[], filename: string, userName: string) {
  const txtContent = [
    `${userName}'s Life Timeline`,
    `Generated on ${new Date().toLocaleDateString()}`,
    '',
    '='.repeat(60),
    '',
    ...events.map((event, index) => {
      const date = event.date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      return [
        `${index + 1}. ${date}`,
        `   ${event.title}`,
        `   Chapter: ${event.chapter.charAt(0).toUpperCase() + event.chapter.slice(1)}`,
        `   ${event.description}`,
        ''
      ].join('\n');
    })
  ].join('\n');
  
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.txt`;
  link.click();
}

function exportToPDF(events: TimelineEvent[], filename: string, userName: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @media print {
            @page { margin: 1in; }
          }
          body { 
            font-family: 'Georgia', serif; 
            padding: 40px; 
            line-height: 1.6;
            color: #333;
          }
          h1 { 
            color: #8BA888; 
            border-bottom: 3px solid #8BA888;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          .event { 
            margin-bottom: 30px; 
            padding: 20px;
            border-left: 4px solid #8BA888;
            background-color: #f9f9f9;
          }
          .date { 
            font-size: 18px; 
            font-weight: bold; 
            color: #8BA888;
            margin-bottom: 10px;
          }
          .title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 8px;
            color: #2c3e2d;
          }
          .chapter { 
            font-size: 12px; 
            color: #666; 
            font-style: italic;
            margin-bottom: 8px;
          }
          .description { 
            font-size: 14px; 
            color: #555;
            line-height: 1.8;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #888;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>${userName}'s Life Timeline</h1>
        <p style="color: #666; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        ${events.map(event => {
          const date = event.date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          return `
            <div class="event">
              <div class="date">${date}</div>
              <div class="title">${event.title}</div>
              <div class="chapter">Chapter: ${event.chapter.charAt(0).toUpperCase() + event.chapter.slice(1)}</div>
              <div class="description">${event.description.replace(/\n/g, '<br>')}</div>
            </div>
          `;
        }).join('')}
        <div class="footer">
          <p>This timeline was generated by Sage</p>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

export function Timeline() {
  const { biography, user } = useStore();
  
  // Convert date strings back to Date objects (they get serialized when stored)
  const timelineEvents = useMemo(() => {
    if (!biography || !biography.timelineEvents) return [];
    return biography.timelineEvents
      .map(event => ({
        ...event,
        date: event.date instanceof Date ? event.date : new Date(event.date)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [biography]);

  const handleExport = (format: ExportFormat) => {
    if (timelineEvents.length === 0) {
      alert('No timeline events to export');
      return;
    }

    const userName = user?.preferredName || 'User';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${userName.replace(/\s+/g, '-')}-timeline-${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(timelineEvents, filename);
        break;
      case 'json':
        exportToJSON(timelineEvents, filename);
        break;
      case 'txt':
        exportToTXT(timelineEvents, filename, userName);
        break;
      case 'pdf':
        exportToPDF(timelineEvents, filename, userName);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
          Life Timeline
        </h2>
        <p className="text-[var(--color-stone)]">
          A chronological view of your life events and memories.
        </p>
      </div>

      {/* Export Controls */}
      {timelineEvents.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download size={18} className="text-[var(--color-stone)]" />
              <span className="text-sm font-medium text-[var(--color-charcoal)]">
                Export Timeline
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('csv')}
                size="sm"
                variant="secondary"
              >
                CSV
              </Button>
              <Button
                onClick={() => handleExport('json')}
                size="sm"
                variant="secondary"
              >
                JSON
              </Button>
              <Button
                onClick={() => handleExport('txt')}
                size="sm"
                variant="secondary"
              >
                TXT
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                size="sm"
                variant="secondary"
              >
                PDF
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Events */}
      {timelineEvents.length === 0 ? (
        <Card className="text-center py-12">
          <Clock size={48} className="text-[var(--color-sage)] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-2">
            No Timeline Events Yet
          </h3>
          <p className="text-[var(--color-stone)] mb-4">
            Start capturing your life story to see events appear here.
          </p>
          <Button
            onClick={() => {
              const { setActiveTab } = useStore.getState();
              setActiveTab('biography');
            }}
            variant="secondary"
          >
            Start Your Story
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-sage)]/10 flex items-center justify-center">
                      <Calendar size={24} className="text-[var(--color-sage)]" />
                    </div>
                    {index < timelineEvents.length - 1 && (
                      <div 
                        className="w-0.5 bg-[var(--color-sand)] ml-7 -mt-2" 
                        style={{ height: 'calc(100% + 1rem)' }} 
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--color-sage)] mb-1">
                          {event.date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: event.date.getDate() !== 1 ? 'numeric' : undefined 
                          })}
                        </div>
                        <h4 className="text-lg font-semibold text-[var(--color-charcoal)] mb-2">
                          {event.title}
                        </h4>
                        <div className="text-xs text-[var(--color-stone)] mb-3">
                          <span className="capitalize">{event.chapter}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-stone)] leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

