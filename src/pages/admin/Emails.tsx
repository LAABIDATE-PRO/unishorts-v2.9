import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { showError, showSuccess } from '@/utils/toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

const fetchTemplates = async (): Promise<EmailTemplate[]> => {
  const { data, error } = await supabase.from('email_templates').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
};

const AdminEmails = () => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['emailTemplates'],
    queryFn: fetchTemplates,
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (template: Partial<EmailTemplate> & { id: string }) => {
      const { id, ...updateData } = template;
      const { error } = await supabase.from('email_templates').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
    onError: (error: Error) => {
      showError(`Failed to update template: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate(selectedTemplate, {
        onSuccess: () => {
          showSuccess('Template updated successfully.');
          setSelectedTemplate(null);
        }
      });
    }
  };

  const handleToggle = (template: EmailTemplate) => {
    updateTemplateMutation.mutate({ id: template.id, is_enabled: !template.is_enabled }, {
      onSuccess: () => {
        showSuccess(`Template ${!template.is_enabled ? 'enabled' : 'disabled'}.`);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Template Manager</CardTitle>
        <CardDescription>Edit and manage automatic emails sent by the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : (
            templates.map(template => (
              <div key={template.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-grow">
                  <p className="font-semibold capitalize">{template.name.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={template.is_enabled}
                    onCheckedChange={() => handleToggle(template)}
                  />
                  <Sheet onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                    <SheetTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedTemplate(template)}>Edit</Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Edit: {selectedTemplate?.name.replace(/_/g, ' ')}</SheetTitle>
                        <SheetDescription>{'Use variables like `{{username}}` or `{{film_title}}`.'}</SheetDescription>
                      </SheetHeader>
                      {selectedTemplate && (
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              value={selectedTemplate.subject}
                              onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="body">Body</Label>
                            <Textarea
                              id="body"
                              value={selectedTemplate.body}
                              onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                              rows={20}
                            />
                          </div>
                          <Button onClick={handleSave} disabled={updateTemplateMutation.isPending}>
                            {updateTemplateMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      )}
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEmails;