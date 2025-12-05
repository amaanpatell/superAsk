"use client";

import Modal from "@/components/ui/modal";
import { useDeleteChat } from "../../hooks/chat";
import { toast } from "sonner";

const DeleteChatModal = ({
  isModalOpen,
  setIsModalOpen,
  chatId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  chatId: string;
}) => {
  const { mutateAsync, isPending } = useDeleteChat(chatId);

  const handleDelete = async () => {
    try {
      await mutateAsync();
      toast.success("Chat deleted successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <Modal
      title="Delete Chat"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        Are you sure you want to delete this Chat? This action cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteChatModal;
