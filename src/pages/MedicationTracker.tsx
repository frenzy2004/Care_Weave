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
import { Pill, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const drugClasses: DrugClass[] = ['anti-inflammatory', 'immunosuppressant', 'biologic', 'antispasmodic', 'probiotic', 'supplement', 'other'];

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
    setName(''); setDosage(''); setFrequency(''); setDrugClass('other');
  };

  const stopMed = (id: string) => {
    updateMedication(id, { endDate: new Date().toISOString().split('T')[0] });
    toast.success('Medication stopped');
  };

  const classColor = (dc: DrugClass) => {
    const map: Record<string, string> = {
      'anti-inflammatory': 'bg-chart-amber/15 text-chart-amber',
      immunosuppressant: 'bg-chart-purple/15 text-chart-purple',
      biologic: 'bg-chart-blue/15 text-chart-blue',
      antispasmodic: 'bg-chart-teal/15 text-chart-teal',
      probiotic: 'bg-chart-teal/15 text-chart-teal',
      supplement: 'bg-muted text-muted-foreground',
      other: 'bg-muted text-muted-foreground',
    };
    return map[dc] || map.other;
  };

  const MedCard = ({ med, isActive }: { med: typeof medications[0]; isActive: boolean }) => (
    <Card key={med.id} className={!isActive ? 'opacity-60' : ''}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Pill className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">{med.name}</p>
            <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={classColor(med.drugClass)} variant="outline">
                {DRUG_CLASS_LABELS[med.drugClass]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(med.startDate), 'MMM d, yyyy')}
                {med.endDate && ` — ${format(parseISO(med.endDate), 'MMM d, yyyy')}`}
              </span>
            </div>
          </div>
        </div>
        {isActive && (
          <Button variant="outline" size="sm" onClick={() => stopMed(med.id)}>
            Stop
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Medication Registry' : 'Medications'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            <Button onClick={handleAdd}>Save Medication</Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">Active ({active.length})</h2>
        <div className="space-y-3">
          {active.map(m => <MedCard key={m.id} med={m} isActive />)}
        </div>
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Past ({past.length})</h2>
          <div className="space-y-3">
            {past.map(m => <MedCard key={m.id} med={m} isActive={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}
