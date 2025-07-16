import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlatformSettings } from "@/types";
import SettingsCard from "./SettingsCard";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const securitySettingsSchema = z.object({
  enable_2fa: z.boolean(),
  failed_login_limit: z.coerce.number().min(1, "Must be at least 1").max(20, "Cannot exceed 20"),
});

interface SecuritySettingsFormProps {
  settings: PlatformSettings;
  onUpdate: (data: Partial<PlatformSettings>) => Promise<void>;
}

const SecuritySettingsForm = ({ settings, onUpdate }: SecuritySettingsFormProps) => {
  const form = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      enable_2fa: settings.enable_2fa || false,
      failed_login_limit: settings.failed_login_limit || 5,
    },
  });

  const handleSubmit = async (values: z.infer<typeof securitySettingsSchema>) => {
    await onUpdate(values);
  };

  return (
    <Form {...form}>
      <SettingsCard
        title="Security Settings"
        description="Configure security options for your platform."
        onSave={form.handleSubmit(handleSubmit)}
        isSaving={form.formState.isSubmitting}
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="enable_2fa"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Enable Two-Factor Authentication (2FA)</FormLabel>
                  <FormDescription>Require users to verify their identity with a second factor.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="failed_login_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Failed Login Limit</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormDescription>Number of failed login attempts before an account is temporarily locked.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default SecuritySettingsForm;