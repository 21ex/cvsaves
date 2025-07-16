import React, { useState } from "react";
import { Plus, Trash2, Palette } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    UserCategoryRow,
    addUserCategory,
    updateUserCategory,
    deleteUserCategory
} from "@/lib/db";
import { useToast } from "../ui/use-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface Props {
    open: boolean;
    categories: UserCategoryRow[];
    onClose: () => void;
    onCategoriesChange: (rows: UserCategoryRow[]) => void;
}

const ManageCategories: React.FC<Props> = ({
    open,
    categories,
    onClose,
    onCategoriesChange,
}) => {
    const { session } = useSessionContext();
    const { toast } = useToast();

    /* local scratch copy so edits aren’t applied until saved */
    const [localCats, setLocalCats] = useState<UserCategoryRow[]>(categories);

    // reset local copy whenever dialog opens
    React.useEffect(() => {
        if (open) setLocalCats(categories);
    }, [open, categories]);

    const handleColorChange = (id: string, color: string) =>
        setLocalCats((c) => c.map((r) => (r.id === id ? { ...r, color } : r)));

    const handleNameChange = (id: string, name: string) =>
        setLocalCats((c) => c.map((r) => (r.id === id ? { ...r, name } : r)));

    const handleAdd = () =>
        setLocalCats((c) => [
            ...c,
            { id: crypto.randomUUID(), user_id: "", name: "New", color: "#999999" },
        ]);

    const handleDelete = (id: string) =>
        setLocalCats((c) => c.filter((r) => r.id !== id));

    /* ----- persist all changes in one go ----- */
    const saveAll = async () => {
        if (!session) return;
        try {
            // diff original vs local
            const originalMap = new Map(categories.map((r) => [r.id, r]));
            const localMap = new Map(localCats.map((r) => [r.id, r]));

            // deleted
            for (const id of originalMap.keys()) {
                if (!localMap.has(id)) await deleteUserCategory(id, session.user.id);
            }
            // added / updated
            for (const row of localCats) {
                if (!originalMap.has(row.id)) {
                    await addUserCategory(session.user.id, row.name, row.color);
                } else {
                    const orig = originalMap.get(row.id)!;
                    if (orig.name !== row.name || orig.color !== row.color) {
                        await updateUserCategory(row.id, { name: row.name, color: row.color });
                    }
                }
            }
            onCategoriesChange(await getUserCategories(session.user.id)); // fresh list
            onClose();
        } catch (e: any) {
            toast({ title: "Save failed", description: e.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-auto">
                    {localCats.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-2">
                            {/* colour picker */}
                            <button
                                className="h-6 w-6 rounded-full border"
                                style={{ backgroundColor: cat.color }}
                                onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "color";
                                    input.value = cat.color;
                                    input.oninput = (e) =>
                                        handleColorChange(cat.id, (e.target as HTMLInputElement).value);
                                    input.click();
                                }}
                            >
                                <Palette className="h-3 w-3 text-white/70" />
                            </button>

                            {/* name */}
                            <Input
                                className="flex-1"
                                value={cat.name}
                                onChange={(e) => handleNameChange(cat.id, e.target.value)}
                            />

                            {/* delete */}
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                    <Button onClick={saveAll}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ManageCategories;
