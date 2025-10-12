import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage all user-generated content</p>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList>
          <TabsTrigger value="quiz">Quiz Responses</TabsTrigger>
          <TabsTrigger value="plans">Content Plans</TabsTrigger>
          <TabsTrigger value="ideas">Generated Ideas</TabsTrigger>
          <TabsTrigger value="chats">Chat Conversations</TabsTrigger>
          <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quiz response management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Content Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content plans management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas">
          <Card>
            <CardHeader>
              <CardTitle>Generated Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Ideas management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Chat Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chat management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contact messages coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
