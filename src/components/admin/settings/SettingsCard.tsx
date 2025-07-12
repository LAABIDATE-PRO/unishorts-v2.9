import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

interface SettingsCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: (event: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

const SettingsCard = ({ title, description, children, onSave, isSaving }: SettingsCardProps) => {
  return (
    <form onSubmit={onSave}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default SettingsCard;