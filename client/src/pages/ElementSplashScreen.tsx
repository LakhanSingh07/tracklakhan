import { Card, CardContent } from "@/components/ui/card";

const columnGroups = [
  {
    position: "top-[-107px] left-[116px]",
    cards: [
      "bg-[#ffffff66]",
      "bg-[#ffffff80]",
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_100%)]",
    ],
  },
  {
    position: "top-[520px] left-[115px]",
    cards: [
      "bg-[linear-gradient(0deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_100%)]",
      "bg-[#ffffff4c]",
      "bg-white-900",
    ],
  },
  {
    position: "top-[-37px] left-[-65px]",
    cards: ["bg-[#ffffff4c]", "bg-[#ffffff33]"],
  },
  {
    position: "top-[381px] left-[-65px]",
    cards: ["bg-[#ffffff33]", "bg-[#ffffff66]"],
  },
  {
    position: "top-[-132px] left-[297px]",
    cards: ["bg-white-900", "bg-[#ffffff4c]"],
  },
  {
    position: "top-[286px] left-[297px]",
    cards: ["bg-[#ffffff4c]", "bg-[#ffffff80]", "bg-[#ffffff4c]"],
  },
];

export const ElementSplashScreen = (): JSX.Element => {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,rgba(249,249,249,1)_0%,rgba(255,240,242,1)_100%)]">
      <section
        aria-hidden="true"
        className="relative mx-auto min-h-screen w-full max-w-[393px] overflow-hidden"
      >
        {columnGroups.map((group, groupIndex) => (
          <div
            key={`column-group-${groupIndex}`}
            className={`absolute flex w-[161px] flex-col items-start gap-5 ${group.position}`}
          >
            {group.cards.map((cardClass, cardIndex) => (
              <Card
                key={`group-${groupIndex}-card-${cardIndex}`}
                className={`w-full rounded-[10px] border-0 shadow-none ${cardClass}`}
              >
                <CardContent className="h-[189px] p-0" />
              </Card>
            ))}
          </div>
        ))}

        <header className="absolute left-0 top-0 z-10 flex h-[45px] w-full items-start justify-between px-[31.3px]">
          <div className="mt-[12.8px] flex w-[49.35px] justify-center rounded-[21.93px]">
            <p className="mt-[0.9px] h-[18.28px] w-[49.35px] text-center text-[15.5px] font-normal leading-[20.1px] tracking-[-0.37px] text-black-900 [font-family:'Helvetica-Roman',Helvetica] whitespace-nowrap">
              9:41
            </p>
          </div>
          <img
            className="mt-[17.4px] h-[11.88px] w-[70.74px]"
            alt="Right side"
            src="/figmaAssets/right-side.png"
          />
        </header>
        <section className="absolute inset-0 flex items-center justify-center px-20">
          <Card className="w-full max-w-[232px] rounded-none border-0 bg-[#f9faf8] shadow-none">
            <CardContent className="flex h-[232px] items-center justify-center p-0">
              <img
                className="h-[232px] w-[232px] object-contain"
                alt="Flowly period tracker logo"
                src="/figmaAssets/image-1.png"
              />
            </CardContent>
          </Card>
        </section>
        <footer className="absolute bottom-0 left-0 flex h-[34px] w-full items-center justify-center">
          <div className="mt-[13px] ml-px h-[5px] w-[134px] rounded-[100px] bg-black-900" />
        </footer>
      </section>
    </main>
  );
};
