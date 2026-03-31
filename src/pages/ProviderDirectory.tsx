import { useState } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Stethoscope } from 'lucide-react';

export default function ProviderDirectory() {
  const { providers, addProvider, removeProvider, doctorMode } = useHealth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');

  const handleAdd = () => {
    if (!name) { toast.error('Provider name is required'); return; }
    addProvider({ name, specialty, clinic });
    toast.success('Provider added');
    setShowForm(false);
    setName(''); setSpecialty(''); setClinic('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Care Team Registry' : 'Your Providers'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 gradient-primary border-0 text-white shadow-md">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in-up gradient-border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Smith" />
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Gastroenterologist" />
              </div>
              <div className="space-y-2">
                <Label>Clinic</Label>
                <Input value={clinic} onChange={e => setClinic(e.target.value)} placeholder="City Medical" />
              </div>
            </div>
            <Button onClick={handleAdd} className="gradient-primary border-0 text-white">Save Provider</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {providers.map((p, i) => (
          <Card key={p.id} className="hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl gradient-teal flex items-center justify-center text-white shrink-0">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-chart-red" onClick={() => { removeProvider(p.id); toast.success('Removed'); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className="mt-1 text-[11px]">{p.specialty}</Badge>
                  {p.clinic && (
                    <p className="text-xs text-muted-foreground mt-2">{p.clinic}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
