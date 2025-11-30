import { Card } from "@/components/ui/card";

const Messages = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with support team</p>
      </div>

      <Card className="p-6">
        <div className="h-[500px] flex items-center justify-center text-muted-foreground">
          <p>Live chat feature coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export default Messages;