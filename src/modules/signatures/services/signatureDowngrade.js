const { knexInstance } = require("../../config/db");

const signatureService = {
  async upgradeDowngradePackage(empresaId, novoPacoteId) {
    const db = await knexInstance();

    // 1️⃣ Buscar assinatura atual da empresa
    const assinaturaAtual = await db("assinaturas")
      .where({ empresa_id: empresaId })
      .first();

    if (!assinaturaAtual) {
      throw new Error("Assinatura não encontrada");
    }

    // 2️⃣ Buscar detalhes do novo pacote
    const novoPacote = await db("pacotes").where({ id: novoPacoteId }).first();

    if (!novoPacote) {
      throw new Error("Pacote não encontrado");
    }

    // 3️⃣ Verificar número de vagas publicadas
    const vagasAtivas = await db("vagas")
      .where({ empresa_id: empresaId, status: "ATIVA" })
      .count("* as total");

    const totalVagasAtivas = vagasAtivas[0].total;

    // 4️⃣ Se downgrade, desativar vagas excedentes
    if (novoPacote.limite_vagas < totalVagasAtivas) {
      const excedente = totalVagasAtivas - novoPacote.limite_vagas;
      await db("vagas")
        .where({ empresa_id: empresaId, status: "ATIVA" })
        .orderBy("created_at", "desc") // Desativa as mais recentes primeiro
        .limit(excedente)
        .update({ status: "DESABILITADA" });
    }

    // 5️⃣ Atualizar a assinatura da empresa
    await db("assinaturas")
      .where({ empresa_id: empresaId })
      .update({ pacote_id: novoPacoteId });

    return { message: "Pacote atualizado com sucesso" };
  },
};

module.exports = signatureService;
