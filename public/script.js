document.addEventListener("DOMContentLoaded", () => {
    // --- REVELAR/OCULTAR SENHA ---
    const senhaInput = document.getElementById("senha");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword && senhaInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = senhaInput.type === "password";
            senhaInput.type = isPassword ? "text" : "password";
            togglePassword.classList.toggle("fa-eye");
            togglePassword.classList.toggle("fa-eye-slash");
        });
    }

    // --- FUNCIONALIDADES DE ESTOQUE (se os elementos existirem) ---
    const table = document.getElementById("estoqueTable")?.getElementsByTagName("tbody")[0];
    const addBtn = document.getElementById("addProductButton");
    const formSection = document.getElementById("formSection");
    const form = document.getElementById("tenisForm");

    if (table && form && addBtn && formSection) {
        const nomeInput = document.getElementById("nome");
        const precoInput = document.getElementById("preco");
        const quantidadeInput = document.getElementById("quantidade");
        const tamanhoInput = document.getElementById("tamanho");
        const corInput = document.getElementById("cor");
        const editandoId = document.getElementById("editandoId");
        const formTitle = document.getElementById("formTitle");
        const cancelarBtn = document.getElementById("cancelarBtn");
        const filtroNome = document.getElementById("filtroNome");
        const filtroTamanho = document.getElementById("filtroTamanho");
        const filtroCor = document.getElementById("filtroCor");

        addBtn.addEventListener("click", () => {
            formTitle.textContent = "Adicionar Tênis";
            formSection.style.display = "block";
            form.reset();
            editandoId.value = "";
        });

        cancelarBtn.addEventListener("click", () => {
            formSection.style.display = "none";
            form.reset();
        });

        async function carregarProdutos() {
            const res = await fetch("/api/estoque");
            let produtos = await res.json();

            const nomeFiltro = filtroNome.value.toLowerCase();
            const tamanhoFiltro = filtroTamanho.value;
            const corFiltro = filtroCor.value.toLowerCase();

            if (nomeFiltro) {
                produtos = produtos.filter(produto =>
                    produto.nome.toLowerCase().includes(nomeFiltro)
                );
            }

            if (tamanhoFiltro) {
                produtos = produtos.filter(produto =>
                    produto.tamanho == parseInt(tamanhoFiltro)
                );
            }

            if (corFiltro) {
                produtos = produtos.filter(produto =>
                    (produto.cor || "").toLowerCase().includes(corFiltro)
                );
            }

            produtos.sort((a, b) => a.nome.localeCompare(b.nome));
            table.innerHTML = "";

            produtos.forEach(produto => {
                const linha = table.insertRow();
                linha.setAttribute("data-id", produto.id);
                linha.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome}</td>
                    <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                    <td>${produto.quantidade}</td>
                    <td>${produto.tamanho}</td>
                    <td>${produto.cor || ""}</td>
                    <td>
                        <button class="editBtn">Editar</button>
                        <button class="removeBtn">Remover</button>
                    </td>
                `;
            });

            atualizarEventos();
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = editandoId.value;
            const produto = {
                nome: nomeInput.value,
                preco: parseFloat(precoInput.value),
                quantidade: parseInt(quantidadeInput.value),
                tamanho: parseInt(tamanhoInput.value),
                cor: corInput.value
            };

            const url = id ? `/api/estoque/${id}` : "/api/estoque";
            const method = id ? "PUT" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(produto)
            });

            formSection.style.display = "none";
            form.reset();
            carregarProdutos();
        });

        function atualizarEventos() {
            const editButtons = document.querySelectorAll(".editBtn");
            const removeButtons = document.querySelectorAll(".removeBtn");

            editButtons.forEach(btn => {
                btn.onclick = () => {
                    const row = btn.closest("tr");
                    const id = row.getAttribute("data-id");

                    nomeInput.value = row.children[1].textContent;
                    precoInput.value = row.children[2].textContent.replace("R$ ", "").replace(",", ".");
                    quantidadeInput.value = row.children[3].textContent;
                    tamanhoInput.value = row.children[4].textContent;
                    corInput.value = row.children[5].textContent;

                    editandoId.value = id;
                    formTitle.textContent = "Editar Tênis";
                    formSection.style.display = "block";
                };
            });

            removeButtons.forEach(btn => {
                btn.onclick = async () => {
                    const row = btn.closest("tr");
                    const id = row.getAttribute("data-id");
                    if (confirm("Tem certeza que deseja remover este item?")) {
                        await fetch(`/api/estoque/${id}`, { method: "DELETE" });
                        carregarProdutos();
                    }
                };
            });
        }

        filtroNome?.addEventListener("input", carregarProdutos);
        filtroTamanho?.addEventListener("input", carregarProdutos);
        filtroCor?.addEventListener("input", carregarProdutos);

        carregarProdutos();
    }
});
