import { useState } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DrugClass, DRUG_CLASS_LABELS } from '@/types/health';
import { Pill, Plus, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const drugClasses: DrugClass[] = ['anti-inflammatory', 'immunosuppressant', 'biologic', 'antispasmodic', 'probiotic', 'supplement', 'other'];

const classGradients: Record<string, string> = {
  'anti-inflammatory': 'from-chart-amber to-chart-red',
  immunosuppressant: 'from-chart-purple to-chart-red',
  biologic: 'from-chart-blue to-chart-teal',
  antispasmodic: 'from-chart-teal to-chart-blue',
  probiotic: 'from-chart-teal to-chart-amber',
  supplement: 'from-muted-foreground/60 to-muted-foreground/40',
  other: 'from-muted-foreground/60 to-muted-foreground/40',
};

export default function MedicationTracker() {
  const { medications, addMedication, updateMedication, providers, doctorMode } = useHealth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [drugClass, setDrugClass] = useState<DrugClass>('other');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [providerId, setProviderId] = useState('');

  const active = medications.filter(m => !m.endDate);
  const past = medications.filter(m => m.endDate);

  const handleAdd = () => {
    if (!name || !dosage) { toast.error('Name and dosage are required'); return; }
    addMedication({ name, dosage, frequency, drugClass, startDate, providerId: providerId || undefined });
    toast.success('Medication added');
    setShowForm(false);
    setName(''); setDosage(''); setFrequency(''); setDrugClass('other'); setStartDate(new Date().toISOString().split('T')[0]); setProviderId('');
  };

  const stopMed = (id: string) => {
    updateMedication(id, { endDate: new Date().toISOString().split('T')[0] });
    toast.success('Medication stopped');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Medication Registry' : 'Medications'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 gradient-primary border-0 text-white shadow-md">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in-up gradient-border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Drug Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mesalamine" />
              </div>
              <div className="space-y-2">
                <Label>Dosage</Label>
                <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 800mg" />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g. Twice daily" />
              </div>
              <div className="space-y-2">
                <Label>Drug Class</Label>
                <Select value={drugClass} onValueChange={v => setDrugClass(v as DrugClass)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {drugClasses.map(dc => (
                      <SelectItem key={dc} value={dc}>{DRUG_CLASS_LABELS[dc]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={providerId} onValueChange={setProviderId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAdd} className="gradient-primary border-0 text-white">Save Medication</Button>
          </CardContent>
        </Card>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-chart-teal" /> Active ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((med, i) => (
              <Card key={med.id} className="hover-lift border-accent-teal animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={`bg-gradient-to-r ${classGradients[med.drugClass]} text-white border-0 text-[10px]`}>
                          {DRUG_CLASS_LABELS[med.drugClass]}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          Since {format(parseISO(med.startDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => stopMed(med.id)} className="hover:border-chart-red hover:text-chart-red transition-colors">
                    Stop
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Past ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map(med => (
              <Card key={med.id} className="hover-lift border-dashed opacity-60 hover:opacity-100 transition-opacity">
                <CardContent className="p-4 flex items-center gap-3">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{DRUG_CLASS_LABELS[med.drugClass]}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {format(parseISO(med.startDate), 'MMM d')} — {format(parseISO(med.endDate!), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
