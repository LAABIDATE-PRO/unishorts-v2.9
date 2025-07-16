import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Institution } from '@/types';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

const institutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required.'),
  approved_domains: z.array(z.string().email("Invalid email domain format.")).optional(),
});

interface InstitutionDialogProps {
  institution: Institution | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof institutionSchema>, id?: string) => void;
  isSaving: boolean;
}

const InstitutionDialog: React.FC<InstitutionDialogProps> = ({ institution, isOpen, onClose, onSave, isSaving }) => {
  const form = useForm<z.infer<typeof institutionSchema>>({
    resolver: zodResolver(institutionSchema),
  });
  const [domainInput, setDomainInput] = useState('');

  useEffect(() => {
    if (institution) {
      form.reset({
        name: institution.name,
        approved_domains: institution.approved_domains || [],
      });
    } else {
      form.reset({ name: '', approved_domains: [] });
    }
  }, [institution, form]);

  const handleSave = (values: z.infer<typeof institutionSchema>) => {
    onSave(values, institution?.id);
  };

  const addDomain = () => {
    if (domainInput && z.string().email().safeParse(`${'test@'}${domainInput}`).success) {
      const currentDomains = form.getValues('approved_domains') || [];
      if (!currentDomains.includes(domainInput)) {
        form.setValue('approved_domains', [...currentDomains, domainInput]);
        setDomainInput('');
      }
    }
  };

  const removeDomain = (domainToRemove: string) => {
    const currentDomains = form.getValues('approved_domains') || [];
    form.setValue('approved_domains', currentDomains.filter(d => d !== domainToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{institution ? 'Edit Institution' : 'Add New Institution'}</DialogTitle>
          <DialogDescription>
            Manage institution details and their approved email domains for auto-linking.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="approved_domains"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved Domains</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., harvard.edu" 
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); }}}
                    />
                    <Button type="button" variant="outline" onClick={addDomain}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map(domain => (
                      <Badge key={domain} variant="secondary">
                        {domain}
                        <button type="button" onClick={() => removeDomain(domain)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionDialog;