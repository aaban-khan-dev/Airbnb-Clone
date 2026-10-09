// Same horizontal padding Airbnb uses: wider margins on bigger screens
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[2520px] px-6 md:px-10 xl:px-20 ${className}`}>
      {children}
    </div>
  );
}
