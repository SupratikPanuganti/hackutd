import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { submitSupportTicket } from "@/lib/supportTicket";
import { useUser } from "@/contexts/UserContext";

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIssue?: string;
}

export const TicketDialog = ({ open, onOpenChange, initialIssue = "" }: TicketDialogProps) => {
  const { user } = useUser();
  const [subject, setSubject] = useState(initialIssue);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubject(initialIssue);
    // Pre-fill email if user is logged in
    if (user?.email) {
      setEmail(user.email);
    }
  }, [initialIssue, open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send support ticket via email
      const result = await submitSupportTicket({
        userEmail: email,
        userName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : undefined,
        subject: subject,
        description: description,
        priority: 'medium',
        category: 'General Support',
      });

      if (result.success) {
        toast({
          title: "✅ Support Ticket Submitted!",
          description: "We've received your ticket and sent a confirmation email. Our team will respond within 24 hours.",
        });

        // Reset form
        onOpenChange(false);
        setSubject("");
        setDescription("");
        if (!user?.email) {
          setEmail("");
        }
      } else {
        toast({
          title: "Failed to Submit Ticket",
          description: result.error || "Please try again or contact support directly.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Open a Support Ticket</DialogTitle>
          <DialogDescription>
            Our support team will get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
