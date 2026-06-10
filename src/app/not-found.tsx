import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ocean-radial px-4 text-center text-white">
      <div className="panel max-w-md p-8">
        <p className="text-sm font-bold text-ocean-accent">404</p>
        <h1 className="mt-3 text-3xl font-black">Паспорт не найден</h1>
        <p className="mt-3 text-cyan-100/65">
          QR ID отсутствует в демо-данных или базе Supabase.
        </p>
        <Link
          href="/buyer"
          className="tap-target mt-6 inline-flex bg-ocean-accent text-ocean-bg"
        >
          Вернуться к лотам
        </Link>
      </div>
    </main>
  );
}
