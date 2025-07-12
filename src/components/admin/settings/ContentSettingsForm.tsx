import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlatformSettings } from "@/types";
import SettingsCard from "./SettingsCard";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const contentSettingsSchema = z.object({
  manual_film_review: z.boolean(),
});

interface ContentSettingsFormProps {
  settings: PlatformSettings;
  onUpdate: (data: Partial<PlatformSettings>) => Promise<void>;
}

const ContentSettingsForm = ({ settings, onUpdate }: ContentSettingsFormProps) => {
  const form = useForm<z.infer<typeof contentSettingsSchema>>({
    resolver: zodResolver(contentSettingsSchema),
    defaultValues: {
      manual_film_review: settings.manual_film_review ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof contentSettingsSchema>) => {
    await onUpdate(values);
  };

  return (
    <Form {...form}>
      <SettingsCard
        title="Content & Submissions"
        description="Manage how film submissions are handled."
        onSave={form.handleSubmit(handleSubmit)}
        isSaving={form.formState.isSubmitting}
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="manual_film_review"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Manual Film Review</FormLabel>
                  <FormDescription>
                    If enabled, all new film submissions must be approved by an admin or moderator before being published.
                  </FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default ContentSettingsForm;