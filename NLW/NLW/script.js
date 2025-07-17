const apiKeyInput = document.getElementById("apiKey");

const gameSelect = document.getElementById("gameSelect");

const questionInput = document.getElementById("questionInput");

const askButton = document.getElementById("askButton");

const aiResponse = document.getElementById("aiResponse");

const form = document.getElementById("form");

const markdownTohtml = (text) => {
    const converter = new showdown.Converter()  
    return converter.makeHtml(text)             
};




const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash";

    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const pergunta = `
        ## Especialidade
        Voce é um assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuario com base no seu conhecimento do jogo, estrategias, build e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta n esta relacionada ao jogo, responda com 'essa pergunta não esta relacionado ao jogo'.
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda no maximo 500 caracteres.
        - Responda em markdown.
        - Faça uma saudação amigavel e simples.
        - Coloque emojis para deixar leve.
        
        ## Exemplo de respostas
        Pergunta do usuário: Melhor build para yone jungle

        resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui. \n\n**Runas:**\n\n exemplo de Runas \n\n**Feitiços:**\n\nexemplo de feitiços aqui\n\n

        ---

        Aqui está a pergunta do usuario: ${question};

    `;

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

   
    const tools = [{
        google_search:{}
    }]

    

    //chama API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          tools
        })
    })

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

const enviarformulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if(apiKey == "" || game == "" || question == ""){
        alert("Por favor, preencha todos os campos")
        return

    }
    
    askButton.disabled = true;
    askButton.textContent = "perguntando";
    askButton.classList.add("loading");


    try{
       
       const text = await perguntarAI(question, game, apiKey);
       console.log("Texto recebido da IA:", text);
       aiResponse.querySelector('.response-content').innerHTML = markdownTohtml (text);
       aiResponse.classList.remove('hidden');
    
    } catch(error){
        console.log("Erro", error);
   
    } finally{
        askButton.disabled = false;
        askButton.textContent = "perguntar";
        askButton.classList.remove("loading");
    }

};


form.addEventListener("submit", enviarformulario);