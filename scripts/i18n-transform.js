export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasUseTranslation = false;
  let hasT = false;

  // Detect existing imports
  root.find(j.ImportDeclaration).forEach((p) => {
    if (p.node.source.value === "react-i18next") {
      hasUseTranslation = true;
    }
  });

  // Detect t()
  root.find(j.VariableDeclarator).forEach((p) => {
    if (p.node.id.name === "t") hasT = true;
  });

  // JSX text → {t("key")}
  root.find(j.JSXText).forEach((path) => {
    const text = path.node.value.trim();
    if (!text || text.length < 3) return;
    if (/^[0-9]+$/.test(text)) return;

    const key = text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 40);

    j(path).replaceWith(
      j.jsxExpressionContainer(
        j.callExpression(j.identifier("t"), [j.literal(key)])
      )
    );
  });

  // JSX attributes
  root.find(j.JSXAttribute).forEach((p) => {
    const v = p.node.value;
    if (!v || v.type !== "Literal") return;

    const text = v.value;
    if (!text || text.length < 3) return;

    const key = text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 40);

    p.node.value = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(key)])
    );
  });

  // Inject useTranslation if missing
  if (!hasUseTranslation) {
    const firstImport = root.find(j.ImportDeclaration).at(0);
    firstImport.insertBefore(
      j.importDeclaration(
        [j.importSpecifier(j.identifier("useTranslation"))],
        j.literal("react-i18next")
      )
    );
  }

  // Inject const { t } = useTranslation();
  if (!hasT) {
    const body = root.find(j.Program).get("body");
    body.value.splice(
      body.value.findIndex((n) => n.type === "FunctionDeclaration") + 1,
      0,
      j.variableDeclaration("const", [
        j.variableDeclarator(
          j.objectPattern([
            j.property(
              "init",
              j.identifier("t"),
              j.identifier("t")
            )
          ]),
          j.callExpression(j.identifier("useTranslation"), [])
        )
      ])
    );
  }

  return root.toSource({ quote: "double" });
}
