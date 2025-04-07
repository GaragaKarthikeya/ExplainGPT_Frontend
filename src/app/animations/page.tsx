import AnimationGenerator from '@/components/AnimationGenerator';

export default function AnimationsPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Manim Animation Generator
      </h1>
      <AnimationGenerator />
    </main>
  );
}