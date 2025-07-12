import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlatformSettings } from "@/types";
import SettingsCard from "./SettingsCard";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const generalSettingsSchema = z.object({
  platform_name: z.string().min(1, "Platform name is required."),
  platform_description: z.string().optional(),
  default_language: z.string(),
  timezone: z.string(),
  maintenance_mode: z.boolean(),
  maintenance_message: z.string().optional(),
  manual_user_approval: z.boolean(),
});

interface GeneralSettingsFormProps {
  settings: PlatformSettings;
  onUpdate: (data: Partial<PlatformSettings>) => Promise<void>;
}

const GeneralSettingsForm = ({ settings, onUpdate }: GeneralSettingsFormProps) => {
  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      platform_name: settings.platform_name || 'UniShorts',
      platform_description: settings.platform_description || '',
      default_language: settings.default_language || 'en',
      timezone: settings.timezone || 'UTC',
      maintenance_mode: settings.maintenance_mode || false,
      maintenance_message: settings.maintenance_message || '',
      manual_user_approval: settings.manual_user_approval ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof generalSettingsSchema>) => {
    await onUpdate(values);
  };

  return (
    <Form {...form}>
      <SettingsCard
        title="General Settings"
        description="Manage basic platform settings."
        onSave={form.handleSubmit(handleSubmit)}
        isSaving={form.formState.isSubmitting}
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="platform_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="platform_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Description</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormDescription>A short summary for SEO and meta tags.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="default_language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="manual_user_approval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Manual Account Approval</FormLabel>
                  <FormDescription>Require admin approval for all new user registrations.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maintenance_mode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Maintenance Mode</FormLabel>
                  <FormDescription>Temporarily disable access to the site.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
          {form.watch('maintenance_mode') && (
            <FormField
              control={form.control}
              name="maintenance_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Message</FormLabel>
                  <FormControl><Textarea {...field} placeholder="The platform is currently down for maintenance. We'll be back shortly!" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </SettingsCard>
    </Form>
  );
};

export default GeneralSettingsForm;