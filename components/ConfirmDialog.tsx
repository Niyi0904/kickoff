'use client';

/**
 * components/ConfirmDialog.tsx
 *
 * A reusable confirmation dialog built on shadcn/ui AlertDialog.
 * Use this everywhere instead of window.confirm() or raw AlertDialog boilerplate.
 *
 * Usage:
 *   <ConfirmDialog
 *     trigger={<Button variant="destructive">Delete</Button>}
 *     title="Delete this player?"
 *     description="James Okafor will be permanently removed from the squad."
 *     confirmLabel="Delete Player"
 *     onConfirm={() => deletePlayer(player.id)}
 *   />
 *
 * Controlled usage (when you need to open it programmatically):
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete all weeks?"
 *     description="This cannot be undone."
 *     confirmLabel="Delete Everything"
 *     onConfirm={handleDeleteAll}
 *   />
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    // Content
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;

    // Action
    onConfirm: () => void;

    // Trigger mode — pass a trigger element for uncontrolled,
    // or open + onOpenChange for controlled (programmatic open).
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    // Style variant — defaults to destructive (red confirm button)
    variant?: 'destructive' | 'default';

    // Disable the confirm button (e.g. while deleting)
    loading?: boolean;
}

export function ConfirmDialog({
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    trigger,
    open,
    onOpenChange,
    variant = 'destructive',
    loading = false,
}: ConfirmDialogProps) {
    const isControlled = open !== undefined;

    return (
        <AlertDialog
            open={isControlled ? open : undefined}
            onOpenChange={isControlled ? onOpenChange : undefined}
        >
            {/* Only render trigger in uncontrolled mode */}
            {!isControlled && trigger && (
                <AlertDialogTrigger asChild>
                    {trigger}
                </AlertDialogTrigger>
            )}

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-muted-foreground text-sm leading-relaxed">
                            {description}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            variant === 'destructive' &&
                            'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                            loading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {loading ? 'Please wait...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}