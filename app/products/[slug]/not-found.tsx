import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-24 text-center">
      <div className="text-7xl mb-4">🥭</div>
      <h1 className="font-display text-4xl font-bold">Aam ta khuje pailam na</h1>
      <p className="mt-2 text-ink/60">
        Ei product ekhono nai othoba slug bhul.
      </p>
      <Link href="/products" className="btn-primary mt-6 inline-flex">
        Shop-e firun
      </Link>
    </section>
  );
}
