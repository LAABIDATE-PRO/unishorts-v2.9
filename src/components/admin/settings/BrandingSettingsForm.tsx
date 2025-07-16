import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlatformSettings } from "@/types";
import SettingsCard from "./SettingsCard";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const brandingSettingsSchema = z.object({
  logo_url: z.string().url().optional().or(z.literal('')),
  favicon_url: z.string().url().optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
  background_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
  theme_mode: z.enum(['light', 'dark', 'system']),
  footer_copyright: z.string().optional(),
});

interface BrandingSettingsFormProps {
  settings: PlatformSettings;
  onUpdate: (data: Partial<PlatformSettings>) => Promise<void>;
}

const BrandingSettingsForm = ({ settings, onUpdate }: BrandingSettingsFormProps) => {
  const form = useForm<z.infer<typeof brandingSettingsSchema>>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      logo_url: settings.logo_url || '',
      favicon_url: settings.favicon_url || '',
      primary_color: settings.primary_color || '#FF5500',
      secondary_color: settings.secondary_color || '#64748b',
      background_color: settings.background_color || '#ffffff',
      theme_mode: settings.theme_mode as 'light' | 'dark' | 'system' || 'system',
      footer_copyright: settings.footer_copyright || '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof brandingSettingsSchema>) => {
    await onUpdate(values);
  };

  return (
    <Form {...form}>
      <SettingsCard
        title="Branding & Appearance"
        description="Customize your platform's look and feel."
        onSave={form.handleSubmit(handleSubmit)}
        isSaving={form.formState.isSubmitting}
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl><Input {...field} placeholder="https://example.com/logo.png" /></FormControl>
                <FormDescription>URL for the main platform logo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="favicon_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Favicon URL</FormLabel>
                <FormControl><Input {...field} placeholder="https://example.com/favicon.ico" /></FormControl>
                <FormDescription>URL for the browser tab icon.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="primary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl><Input type="color" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Color</FormLabel>
                  <FormControl><Input type="color" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="background_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl><Input type="color" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <FormField
            control={form.control}
            name="theme_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Set the default theme for all users.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="footer_copyright"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer Copyright</FormLabel>
                <FormControl><Input {...field} placeholder={`© ${new Date().getFullYear()} UniShorts. All rights reserved.`} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default BrandingSettingsForm;