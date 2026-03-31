import { useState } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Plus, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function VisitsLog() {
  const { visits, addVisit, providers, doctorMode } = useHealth();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [providerId, setProviderId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!providerId || !purpose) { toast.error('Provider and purpose required'); return; }
    addVisit({ date, providerId, purpose, notes, linkedMedIds: [], linkedSymptomIds: [] });
    toast.success('Visit recorded');
    setShowForm(false);
    setPurpose(''); setNotes(''); setDate(new Date().toISOString().split('T')[0]); setProviderId('');
  };

  const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || 'Unknown';
  const sorted = [...visits].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Clinical Visits' : 'Visits'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 gradient-primary border-0 text-white shadow-md">
          <Plus className="h-4 w-4" /> Record Visit
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in-up gradient-border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={providerId} onValueChange={setProviderId}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Follow-up consultation" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Visit outcomes..." rows={3} />
            </div>
            <Button onClick={handleAdd} className="gradient-primary border-0 text-white">Save Visit</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sorted.map((v, i) => (
          <Card key={v.id} className="hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{v.purpose}</span>
                      <Badge variant="outline" className="text-[10px] bg-muted/50">{getProviderName(v.providerId)}</Badge>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{format(parseISO(v.date), 'MMM d, yyyy')}</Badge>
                  </div>
                  {v.notes && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{v.notes}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
