import SessionForm from "@/components/SessionForm";
import { Icon } from "@iconify/react";

export default function NewSessionPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl mb-6 flex items-center gap-3">
        <Icon icon="lucide:mic" className="text-teal-400" />
        New Session
      </h1>
      <SessionForm />
    </div>
  );
}
