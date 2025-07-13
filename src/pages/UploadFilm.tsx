import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import FileUpload from '@/components/FileUpload';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

const filmSchema = z.object({
  title: z.string().min(1, "Film title is required."),
  description: z.string().min(1, "Film synopsis is required.").max(500, "Synopsis must not exceed 500 characters."),
  director_names: z.string().min(1, "Director's name is required."),
  institution: z.string().min(1, "Institution name is required."),
  genre: z.string().min(1, "Genre is required."),
  duration_minutes: z.coerce.number().positive("Duration must be a positive number."),
  language: z.string().min(1, "Language is required."),
  release_date: z.date({ required_error: "Release date is required." }),
  production_year: z.coerce.number().min(1900, "Invalid production year.").max(new Date().getFullYear() + 1, "Invalid production year."),
  filming_country: z.string().min(1, "Filming country is required."),
  tags: z.string().optional(),
  trailer_url: z.string().url("Invalid trailer URL.").optional().or(z.literal('')),
  subtitles: z.array(z.string()).optional(),
  submission_notes: z.string().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  confirm_rights: z.boolean().refine(val => val === true, { message: "You must confirm you own the rights." }),
  confirm_terms: z.boolean().refine(val => val === true, { message: "You must agree to the terms of service." }),
  thumbnail: z.instanceof(File, { message: "Thumbnail image is required." }),
  video: z.instanceof(File, { message: "Video file is required." }),
});

const UploadFilm = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof filmSchema>>({
    resolver: zodResolver(filmSchema),
    defaultValues: {
      title: '',
      description: '',
      director_names: '',
      institution: '',
      trailer_url: '',
      tags: '',
      subtitles: [],
      submission_notes: '',
      visibility: 'public',
      confirm_rights: false,
      confirm_terms: false,
    },
  });

  const title = form.watch('title');
  const description = form.watch('description');
  const tags = form.watch('tags') || '';

  const handleAddTag = (tag: string) => {
    const currentTags = form.getValues('tags') || '';
    const newTags = currentTags ? `${currentTags}, ${tag}` : tag;
    form.setValue('tags', newTags, { shouldValidate: true });
  };

  const onSubmit = async (values: z.infer<typeof filmSchema>) => {
    if (!session?.user) {
      showError('You must be logged in to upload a film.');
      return;
    }
    setIsUploading(true);
    const toastId = showLoading('Starting upload process...');

    try {
      dismissToast(String(toastId));
      const thumbToast = showLoading('Uploading thumbnail...');
      const thumbExt = values.thumbnail.name.split('.').pop();
      const thumbPath = `${session.user.id}/${Date.now()}.${thumbExt}`;
      const { error: thumbError } = await supabase.storage.from('thumbnails').upload(thumbPath, values.thumbnail);
      if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
      const { data: { publicUrl: thumbnailUrl } } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath);
      dismissToast(String(thumbToast));

      const videoToast = showLoading('Uploading video...');
      const videoExt = values.video.name.split('.').pop();
      const videoPath = `${session.user.id}/${Date.now()}.${videoExt}`;
      const { error: videoError } = await supabase.storage.from('videos').upload(videoPath, values.video);
      if (videoError) throw new Error(`Video upload failed: ${videoError.message}`);
      const { data: { publicUrl: videoUrl } } = supabase.storage.from('videos').getPublicUrl(videoPath);
      dismissToast(String(videoToast));

      const dbToast = showLoading('Saving film data...');
      
      const filmRecord = {
        user_id: session.user.id,
        title: values.title,
        description: values.description,
        director_names: values.director_names,
        institution: values.institution,
        genre: values.genre,
        duration_minutes: values.duration_minutes,
        language: values.language,
        release_date: values.release_date.toISOString(),
        production_year: values.production_year,
        filming_country: values.filming_country,
        tags: values.tags,
        trailer_url: values.trailer_url,
        subtitles: values.subtitles,
        submission_notes: values.submission_notes,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        status: 'in_review',
        visibility: values.visibility,
      };

      const { error: insertError } = await supabase.from('films').insert(filmRecord);
      if (insertError) throw new Error(`Failed to save film data: ${insertError.message}`);
      dismissToast(String(dbToast));

      showSuccess('Your film has been submitted successfully and will be reviewed within 24-72 hours.');
      navigate('/dashboard');

    } catch (error: any) {
      dismissToast(String(toastId));
      showError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 space-y-8">
                <FileUpload
                  label="Upload Film File"
                  description=".mp4, .mov (Max 500MB)"
                  acceptedFileTypes="video/mp4,video/quicktime"
                  onFileChange={(file) => form.setValue('video', file as File, { shouldValidate: true })}
                  isUploading={isUploading}
                  className="h-80"
                />
                <FormField control={form.control} name="video" render={() => <FormMessage />} />
                
                <FileUpload
                  label="Upload Thumbnail"
                  description=".jpg, .png (Recommended: 1920x1080)"
                  acceptedFileTypes="image/jpeg,image/png"
                  onFileChange={(file) => form.setValue('thumbnail', file as File, { shouldValidate: true })}
                  isUploading={isUploading}
                  className="h-64"
                />
                <FormField control={form.control} name="thumbnail" render={() => <FormMessage />} />
              </div>

              <div className="lg:col-span-2 space-y-6 bg-card p-6 rounded-lg">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Film Title</FormLabel><FormControl><Input placeholder="e.g., The Great Escape" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Film Synopsis</FormLabel><FormControl><Textarea placeholder="Give a short summary of your film." {...field} rows={5} /></FormControl><FormDescription className="text-right">{description?.length || 0}/500</FormDescription><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="director_names" render={({ field }) => (
                    <FormItem><FormLabel>Director Name(s)</FormLabel><FormControl><Input placeholder="Creator names" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="institution" render={({ field }) => (
                    <FormItem><FormLabel>Institution / School</FormLabel><FormControl><Input placeholder="e.g., ENSAD Casablanca" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="genre" render={({ field }) => (
                    <FormItem><FormLabel>Genre</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger></FormControl><SelectContent>{genres.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="duration_minutes" render={({ field }) => (
                    <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormItem><FormLabel>Production Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2025" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="filming_country" render={({ field }) => (
                    <FormItem><FormLabel>Filming Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="space-y-2">
                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem><FormLabel>Tags (Optional)</FormLabel><FormControl><Input placeholder="Migration, Identity, Youth" {...field} /></FormControl><FormDescription>Separate tags with a comma.</FormDescription><FormMessage /></FormItem>
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
                <div className="space-y-4">
                  <FormField control={form.control} name="confirm_rights" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm that I own the rights or have permission to submit this film.</FormLabel></div></FormItem>
                  )} />
                  <FormField control={form.control} name="confirm_terms" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I agree to the platform's <Button variant="link" asChild type="button" className="p-0 h-auto"><Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link></Button>.</FormLabel></div></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Submitting...' : 'Submit Film for Review'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default UploadFilm;