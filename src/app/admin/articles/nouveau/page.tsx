import ArticleEditor from "@/components/admin/ArticleEditor";

export const metadata = {
  title: "Nouvel article | Admin",
};

export default function NewArticlePage() {
  return (
    <div className="animate-fade-in">
      <ArticleEditor />
    </div>
  );
}
