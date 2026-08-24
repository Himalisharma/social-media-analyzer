const FAQS = [
  {
    q: "Does anything I upload leave my browser?",
    a: "No. File reading, OCR, and scoring all run locally in this tab. Nothing is uploaded to a server.",
  },
  {
    q: "What files can I analyze?",
    a: "PDF, PNG, JPG, or WEBP, up to 20MB. Exported post PDFs work best; screenshots and scans go through OCR automatically.",
  },
  {
    q: "Which platforms does Margin score for?",
    a: "General, X/Twitter, Instagram, and LinkedIn, each with their own ideal length, limits, and hashtag ranges. Switch platforms any time to re-score instantly.",
  },
  {
    q: "What if the OCR gets something wrong?",
    a: "Switch to Edit text in the workspace, fix anything that misread, then Save & re-analyze to update the score.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-14 scroll-mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-10">
        <div>
          <h2 className="font-display text-3xl text-ink">About Margin</h2>
          <p className="font-sans text-sm sm:text-base text-ink-dim mt-3 leading-relaxed">
            Margin reads your post the way an editor would — hook first, then structure, length,
            and the small mechanical things that quietly hurt engagement. It runs entirely in your
            browser, so nothing you upload is ever sent anywhere.
          </p>
        </div>

        <dl className="space-y-6">
          {FAQS.map((item) => (
            <div key={item.q} className="border-t border-ink-softer pt-4 first:border-t-0 first:pt-0">
              <dt className="font-sans text-sm font-semibold text-ink">{item.q}</dt>
              <dd className="font-sans text-sm text-ink-dim mt-1.5 leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
