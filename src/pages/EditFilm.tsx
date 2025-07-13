import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Film } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import BackButton from '@/components/BackButton';
import AiKeywordGenerator from '@/components/AiKeywordGenerator';

const countries = ["Saudi Arabia", "United Arab Emirates", "Egypt", "Morocco", "USA", "UK"];
const genres = ["Drama", "Documentary", "Comedy", "Horror", "Animation", "Experimental"];
const languages = ["Arabic", "English", "French", "Spanish"];
const subtitlesOptions = [
  { id: 'arabic', label: 'Arabic' },
  { id: 'english', label: 'English' },
  { id: 'french', label: 'French' },
];

const editFilmSchema = z.object({
  title: z.string().min(1, "Film title is required."),
  description: z.string().min(1, "Film synopsis is required.").max(500, "Synopsis must not exceed 500 characters."),
  director_names: z.string().min(1, "Director's name is required."),
  institution: z.string().min(1, "Institution name is required."),
  genre: z.string().min(1, "Genre is required."),
  duration_minutes: z.coerce.number().positive("Duration must be a positive number.").nullable(),
  language: z.string().min(1, "Language is required."),
  release_date: z.date({ required_error: "Release date is required." }),
  production_year: z.coerce.number().min(1900, "Invalid production year.").max(new Date().getFullYear() + 1, "Invalid production year.").nullable(),
  filming_country: z.string().min(1, "Filming country is required."),
  tags: z.string().optional(),
  trailer_url: z.string().url("Invalid trailer URL.").optional().or(z.literal('')),
  subtitles: z.array(z.string()).optional(),
  submission_notes: z.string().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
});

const EditFilm = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const navigate = useNavigate();
  const [film, setFilm] = useState<Film | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof editFilmSchema>>({
    resolver: zodResolver(editFilmSchema),
  });

  const title = form.watch('title');
  const description = form.watch('description');
  const tags = form.watch('tags') || '';

  const handleAddTag = (tag: string) => {
    const currentTags = form.getValues('tags') || '';
    const newTags = currentTags ? `${currentTags}, ${tag}` : tag;
    form.setValue('tags', newTags, { shouldValidate: true });
  };

  useEffect(() => {
    const fetchFilm = async () => {
      if (!id) return;
      setIsLoading(true);
      const { data, error } = await supabase.from('films').select('*').eq('id', id).single();

      if (error || !data || data.user_id !== session?.user?.id) {
        showError('Failed to find film or you do not have permission to edit it.');
        navigate('/dashboard');
      } else {
        setFilm(data);
        form.reset({
          title: data.title,
          description: data.description || '',
          director_names: data.director_names || '',
          institution: data.institution || '',
          genre: data.genre || '',
          duration_minutes: data.duration_minutes,
          language: data.language || '',
          release_date: data.release_date ? new Date(data.release_date) : new Date(),
          production_year: data.production_year,
          filming_country: data.filming_country || '',
          tags: data.tags || '',
          trailer_url: data.trailer_url || '',
          subtitles: data.subtitles || [],
          submission_notes: data.submission_notes || '',
          visibility: data.visibility || 'public',
        });
      }
      setIsLoading(false);
    };
    if (session) fetchFilm();
  }, [id, session, navigate, form]);

  const onUpdate = async (values: z.infer<typeof editFilmSchema>, newStatus?: Film['status']) => {
    if (!film) return;
    setIsSubmitting(true);
    const toastId = showLoading('Saving changes...');

    const updateData: Partial<Film> = {
      ...values,
      release_date: values.release_date.toISOString(),
    };
    if (newStatus) {
      updateData.status = newStatus;
    }

    try {
      const { error } = await supabase.from('films').update(updateData).eq('id', film.id);
      if (error) throw error;

      dismissToast(String(toastId));
      showSuccess('Film updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      dismissToast(String(toastId));
      showError(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto p-4 md:p-8"><Skeleton className="h-96 w-full max-w-2xl mx-auto" /></main>
      </>
    );
  }

  if (!film) return null;

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Film: {film.title}</CardTitle>
            <CardDescription>Update your film's details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => onUpdate(values))} className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Film Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Film Synopsis</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="director_names" render={({ field }) => (
                    <FormItem><FormLabel>Director Name(s)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="institution" render={({ field }) => (
                    <FormItem><FormLabel>Institution / School</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="genre" render={({ field }) => (
                    <FormItem><FormLabel>Genre</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger></FormControl><SelectContent>{genres.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="duration_minutes" render={({ field }) => (
                    <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="language" render={({ field }) => (
                    <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl><SelectContent>{languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="release_date" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Release Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="production_year" render={({ field }) => (
                    <FormItem><FormLabel>Production Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="filming_country" render={({ field }) => (
                    <FormItem><FormLabel>Filming Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                </div>
                 <div className="space-y-2">
                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem><FormLabel>Tags (Optional)</FormLabel><FormControl><Input placeholder="Migration, Identity, Youth" {...field} value={field.value || ''} /></FormControl><FormDescription>Separate tags with a comma.</FormDescription><FormMessage /></FormItem>
                  )} />
                  <AiKeywordGenerator
                    title={title}
                    description={description}
                    currentTags={tags}
                    onTagAdd={handleAddTag}
                  />
                </div>
                <FormField control={form.control} name="trailer_url" render={({ field }) => (
                  <FormItem><FormLabel>Trailer URL (Optional)</FormLabel><FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subtitles" render={() => (
                  <FormItem><FormLabel>Available Subtitles?</FormLabel><div className="flex items-center space-x-4">{subtitlesOptions.map((item) => (<FormField key={item.id} control={form.control} name="subtitles" render={({ field }) => (<FormItem key={item.id} className="flex flex-row items-start space-x-2 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))}} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>)} />))}</div><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="visibility" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Privacy</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="public" /></FormControl><FormLabel className="font-normal">Public (Anyone can watch the film)</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="private" /></FormControl><FormLabel className="font-normal">Private (Only you can see it)</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="unlisted" /></FormControl><FormLabel className="font-normal">Unlisted (Only people with the link can watch)</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="submission_notes" render={({ field }) => (
                  <FormItem><FormLabel>Submission Notes (Optional)</FormLabel><FormControl><Textarea placeholder="This film is part of my graduation project..." {...field} /></FormControl><FormDescription>For special notes to the reviewers.</FormDescription><FormMessage /></FormItem>
                )} />
                <div className="flex gap-2 justify-end">
                  <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
                  {film.status === 'draft' && (
                    <Button onClick={form.handleSubmit((values) => onUpdate(values, 'in_review'))} disabled={isSubmitting}>
                      Save and Submit for Review
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditFilm;