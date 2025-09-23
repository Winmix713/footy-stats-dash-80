import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Info, AlertCircle, Trash2, Download } from 'lucide-react';
import { apiLogger, type LogEntry } from '@/utils/apiLogger';

export const ApiLogsViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => apiLogger.getLogs());
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const refreshLogs = () => {
    setLogs(apiLogger.getLogs());
  };

  const clearLogs = () => {
    apiLogger.clearLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: logs
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => 
    filterLevel === 'all' || log.level === filterLevel
  );

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
        return 'outline';
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              API Logs
            </CardTitle>
            <CardDescription>
              Real-time API request and response logging ({logs.length} entries)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshLogs}>
              Frissítés
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="destructive" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-2" />
              Törlés
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filterLevel} onValueChange={(value) => setFilterLevel(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Összes ({logs.length})</TabsTrigger>
            <TabsTrigger value="info">
              Info ({logs.filter(l => l.level === 'info').length})
            </TabsTrigger>
            <TabsTrigger value="warn">
              Warn ({logs.filter(l => l.level === 'warn').length})
            </TabsTrigger>
            <TabsTrigger value="error">
              Error ({logs.filter(l => l.level === 'error').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filterLevel} className="mt-4">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nincsenek logbejegyzések
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      {getLogIcon(log.level)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getLogBadgeVariant(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          {log.context && (
                            <Badge variant="outline">
                              {log.context}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString('hu-HU')}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.data && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Részletek megjelenítése
                            </summary>
                            <pre className="mt-2 p-2 bg-background rounded border overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};