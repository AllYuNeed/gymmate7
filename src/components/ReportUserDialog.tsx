import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitUserReport, type ReportContext } from "@/lib/reporting";
import { toast } from "sonner";

const REASONS = [
  "Harassment or abuse",
  "Spam or scam",
  "Hate or threats",
  "Inappropriate content",
  "Fake workout or cheating",
  "Other safety concern",
];

interface ReportUserDialogProps {
  reporterId?: string;
  reportedUserId: string;
  reportedName?: string | null;
  context: ReportContext;
  contextId?: string | null;
  size?: "sm" | "icon";
}

export function ReportUserDialog({
  reporterId,
  reportedUserId,
  reportedName,
  context,
  contextId,
  size = "sm",
}: ReportUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!reporterId) {
      toast.error("Sign in to report a user.");
      return;
    }

    setSaving(true);
    try {
      await submitUserReport({
        reporterId,
        reportedUserId,
        reason,
        details,
        context,
        contextId,
      });
      toast.success("Report submitted. Thank you for helping keep Mortal Gyms safe.");
      setDetails("");
      setReason(REASONS[0]);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {size === "icon" ? (
          <Button variant="ghost" size="icon" title="Report user">
            <Flag className="h-4 w-4" />
          </Button>
        ) : (
          <button
            type="button"
            className="rounded border border-border px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-muted-foreground hover:border-destructive hover:text-destructive"
          >
            Report
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-surface-deep">
        <DialogHeader>
          <DialogTitle className="font-display text-gold">Report User</DialogTitle>
          <DialogDescription>
            Report {reportedName ?? "this user"} for review. Reports are private and help moderation decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Reason
            </label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Details
            </label>
            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              placeholder="Add message, profile, or guild context..."
              className="mt-2 min-h-28 bg-background"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={submit} disabled={saving}>
            {saving ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
