import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";
import { Polygon } from "./polygon";
import { Cuboid } from "./cuboid";

const exampleMessages = [
  "Draw a triangle.",
  "Draw a square.",
  "Draw a trapazoid.",
  "Draw a rectangle.",
  "Draw a right angled triangle.",
  "Draw a right angled triangle. And mark the 90degree angle.",
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8 mb-4">
        <h1 className="mb-2 text-lg font-semibold">Geometry!</h1>
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={async () => {
                submitMessage(message);
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message}
            </Button>
          ))}
        </div>
        <Cuboid size={[2, 1]} sides={[true, true, true]} />
        <Polygon
          points="50,150 250,50 250,150"
          angles={[false, false, true]}
          sides={["hüpotenuus", false, false]}
        />
      </div>
    </div>
  );
}
