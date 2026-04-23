const CHOICE_MAP = { A: 'D', B: 'I', C: 'S', D: 'C', D: 'D', I: 'I', S: 'S', C: 'C' }

export const DISC_QUESTIONS = [
  { group: 1, statements: [
    { letter: 'A', text: 'Eu tomo decisões rapidamente e assumo o controle da situação', factor: 'D' },
    { letter: 'B', text: 'Eu gosto de motivar e influenciar as pessoas ao meu redor', factor: 'I' },
    { letter: 'C', text: 'Eu sou paciente e perseverante, prefiro trabalhar com constância', factor: 'S' },
    { letter: 'D', text: 'Eu verifico todos os detalhes e sigo procedimentos com precisão', factor: 'C' }
  ]},
  { group: 2, statements: [
    { letter: 'A', text: 'Eu enfrento desafios de frente e não recuo facilmente', factor: 'D' },
    { letter: 'B', text: 'Eu me comunico com facilidade e faço amizades rapidamente', factor: 'I' },
    { letter: 'C', text: 'Eu sou leal e valorizo relações estáveis e duradouras', factor: 'S' },
    { letter: 'D', text: 'Eu organizo informações de forma lógica e sistemática', factor: 'C' }
  ]},
  { group: 3, statements: [
    { letter: 'A', text: 'Eu sou direto e vou ao ponto sem rodeios', factor: 'D' },
    { letter: 'B', text: 'Eu trago energia positiva e entusiasmo para qualquer ambiente', factor: 'I' },
    { letter: 'C', text: 'Eu prefiro ambientes previsíveis e rotinas tranquilas', factor: 'S' },
    { letter: 'D', text: 'Eu valorizo qualidade e perfeição em tudo que faço', factor: 'C' }
  ]},
  { group: 4, statements: [
    { letter: 'A', text: 'Eu lidero naturalmente e as pessoas costumam me seguir', factor: 'D' },
    { letter: 'B', text: 'Eu me expresso bem e gosto de falar em público', factor: 'I' },
    { letter: 'C', text: 'Eu sou um bom ouvinte e ofereço apoio emocional aos outros', factor: 'S' },
    { letter: 'D', text: 'Eu sigo regras e expectativas com comprometimento total', factor: 'C' }
  ]},
  { group: 5, statements: [
    { letter: 'A', text: 'Eu me sinto confortável tomando decisões sob pressão', factor: 'D' },
    { letter: 'B', text: 'Eu gosto de celebrar conquistas e reconhecer o time', factor: 'I' },
    { letter: 'C', text: 'Eu prefiro trabalhar em equipe do que sozinho', factor: 'S' },
    { letter: 'D', text: 'Eu analiso dados e evidências antes de tomar qualquer decisão', factor: 'C' }
  ]},
  { group: 6, statements: [
    { letter: 'A', text: 'Eu busco resultados e me importo com o objetivo final', factor: 'D' },
    { letter: 'B', text: 'Eu sou carismático e consigo convencer pessoas facilmente', factor: 'I' },
    { letter: 'C', text: 'Eu demonstro empatia e me preocupo com o bem-estar de todos', factor: 'S' },
    { letter: 'D', text: 'Eu mantenho tudo documentado e organizado de forma impecável', factor: 'C' }
  ]},
  { group: 7, statements: [
    { letter: 'A', text: 'Eu aceito riscos calculados para alcançar grandes objetivos', factor: 'D' },
    { letter: 'B', text: 'Eu networko naturalmente e mantinha contato com muitas pessoas', factor: 'I' },
    { letter: 'C', text: 'Eu sou confiável e as pessoas podem contar comigo sempre', factor: 'S' },
    { letter: 'D', text: 'Eu priorizo a exatidão e não deixo nada pela metade', factor: 'C' }
  ]},
  { group: 8, statements: [
    { letter: 'A', text: 'Eu defendo minhas opiniões com firmeza e convicção', factor: 'D' },
    { letter: 'B', text: 'Eu adapto meu estilo de comunicação para cada audiência', factor: 'I' },
    { letter: 'C', text: 'Eu espero pacientemente os resultados em vez de forçar o ritmo', factor: 'S' },
    { letter: 'D', text: 'Eu crio processos e checklists para garantir consistência', factor: 'C' }
  ]},
  { group: 9, statements: [
    { letter: 'A', text: 'Eu valorizo a eficiência acima de tudo e elimino desperdícios', factor: 'D' },
    { letter: 'B', text: 'Eu gosto de ser o centro das atenções e animar o grupo', factor: 'I' },
    { letter: 'C', text: 'Eu prefiro estabilidade e evito mudanças bruscas', factor: 'S' },
    { letter: 'D', text: 'Eu me asseguro de que tudo está correto antes de entregar', factor: 'C' }
  ]},
  { group: 10, statements: [
    { letter: 'A', text: 'Eu me aposso rapidamente de novos projetos e responsabilidades', factor: 'D' },
    { letter: 'B', text: 'Eu encontro oportunidades de colaborar e criar conexões', factor: 'I' },
    { letter: 'C', text: 'Eu executo tarefas com dedicação e sem reclamar', factor: 'S' },
    { letter: 'D', text: 'Eu estabeleço padrões altos e exijo o melhor de mim e dos outros', factor: 'C' }
  ]},
  { group: 11, statements: [
    { letter: 'A', text: 'Eu aceito confrontos quando necessário para resolver problemas', factor: 'D' },
    { letter: 'B', text: 'Eu espontâneamente me envolvo em atividades sociais', factor: 'I' },
    { letter: 'C', text: 'Eu construo confiança através de ações consistentes no tempo', factor: 'S' },
    { letter: 'D', text: 'Eu me preparo minuciosamente para cada situação', factor: 'C' }
  ]},
  { group: 12, statements: [
    { letter: 'A', text: 'Eu traço metas ambiciosas e trabalho duro para alcançá-las', factor: 'D' },
    { letter: 'B', text: 'Eu gero ideias criativas e dramatizo soluções inovadoras', factor: 'I' },
    { letter: 'C', text: 'Eu priorizo harmonia e evito conflitos desnecessários', factor: 'S' },
    { letter: 'D', text: 'Eu mantenho registros detalhados de tudo que é importante', factor: 'C' }
  ]},
  { group: 13, statements: [
    { letter: 'A', text: 'Eu competo para vencer e me destaco nos desafios', factor: 'D' },
    { letter: 'B', text: 'Eu envolvo outros no processo e crio senso de equipe', factor: 'I' },
    { letter: 'C', text: 'Eu cumpro promessas e honro compromissos sem hesitar', factor: 'S' },
    { letter: 'D', text: 'Eu investigo a fundo para entender as causas dos problemas', factor: 'C' }
  ]},
  { group: 14, statements: [
    { letter: 'A', text: 'Eu delego tarefas e espero execução imediata', factor: 'D' },
    { letter: 'B', text: 'Eu chamo a atenção positivamente e elogio em público', factor: 'I' },
    { letter: 'C', text: 'Eu ofereço suporte constante e meu apoio é inabalável', factor: 'S' },
    { letter: 'D', text: 'Eu faço avaliações objetivas baseadas em fatos concretos', factor: 'C' }
  ]},
  { group: 15, statements: [
    { letter: 'A', text: 'Eu me movo rapidamente e fico impaciente com lentidão', factor: 'D' },
    { letter: 'B', text: 'Eu me expresso com gestos e emoções visíveis', factor: 'I' },
    { letter: 'C', text: 'Eu sou tolerante e perdão erros com facilidade', factor: 'S' },
    { letter: 'D', text: 'Eu questiono tudo que não parece lógico ou consistente', factor: 'C' }
  ]},
  { group: 16, statements: [
    { letter: 'A', text: 'Eu determino direções e não gosto de ser contrariado', factor: 'D' },
    { letter: 'B', text: 'Eu visualizo possibilidades fascinantes e contagio os outros', factor: 'I' },
    { letter: 'C', text: 'Eu equilibro as necessidades do grupo e busco consenso', factor: 'S' },
    { letter: 'D', text: 'Eu critico ideias para encontrar falhas e melhorá-las', factor: 'C' }
  ]},
  { group: 17, statements: [
    { letter: 'A', text: 'Eu produzo resultados mesmo com recursos limitados', factor: 'D' },
    { letter: 'B', text: 'Eu simplifio o complexo e comunico de forma envolvente', factor: 'I' },
    { letter: 'C', text: 'Eu sintonizo com as necessidades dos outros e ajo com gentileza', factor: 'S' },
    { letter: 'D', text: 'Eu giámiders riscos apenas quando os dados suportam a decisão', factor: 'C' }
  ]},
  { group: 18, statements: [
    { letter: 'A', text: 'Eu assumo decisões difíceis que outros evitam', factor: 'D' },
    { letter: 'B', text: 'Eu transformo ideias abstratas em narrativas cativantes', factor: 'I' },
    { letter: 'C', text: 'Eu medío conflitos e busco soluções onde todos ganham', factor: 'S' },
    { letter: 'D', text: 'Eu estudio padrões e tendências para prever resultados', factor: 'C' }
  ]},
  { group: 19, statements: [
    { letter: 'A', text: 'Eu não temo confronto e defendo meus pontos com firmeza', factor: 'D' },
    { letter: 'B', text: 'Eu me conecto emocionalmente e crio laços fortes rapidamente', factor: 'I' },
    { letter: 'C', text: 'Eu mantenho a calma em situações de crise e estabilidade', factor: 'S' },
    { letter: 'D', text: 'Eu reviso cuidadosamente antes de aprovar qualquer entrega', factor: 'C' }
  ]},
  { group: 20, statements: [
    { letter: 'A', text: 'Eu priorizo ação sobre reflexão e decido rápido', factor: 'D' },
    { letter: 'B', text: 'Eu me destaco socialmente e gosto de eventos e encontros', factor: 'I' },
    { letter: 'C', text: 'Eu valorizo tradições e mantenho o que já funciona', factor: 'S' },
    { letter: 'D', text: 'Eu padronizo processos para eliminar variabilidade', factor: 'C' }
  ]},
  { group: 21, statements: [
    { letter: 'A', text: 'Eu cobro resultados das pessoas e espero alta performance', factor: 'D' },
    { letter: 'B', text: 'Eu energizo equipes desmotivadas com meu otimismo', factor: 'I' },
    { letter: 'C', text: 'Eu ofereço ajuda antes mesmo de ser solicitado', factor: 'S' },
    { letter: 'D', text: 'Eu identifico inconsistências que outros não percebem', factor: 'C' }
  ]},
  { group: 22, statements: [
    { letter: 'A', text: 'Eu desafio o status quo e proponho mudanças ousadas', factor: 'D' },
    { letter: 'B', text: 'Eu conto histórias que inspiram e engajam as pessoas', factor: 'I' },
    { letter: 'C', text: 'Eu espero o momento certo e não forço situações', factor: 'S' },
    { letter: 'D', text: 'Eu classifico e categorizo informações para facilitar decisões', factor: 'C' }
  ]},
  { group: 23, statements: [
    { letter: 'A', text: 'Eu mantenho o foco no objetivo mesmo com distrações', factor: 'D' },
    { letter: 'B', text: 'Eu descubro talentos nas pessoas e os incentivo a brilhar', factor: 'I' },
    { letter: 'C', text: 'Eu mantenho relações de longo prazo e valorizo fidelidade', factor: 'S' },
    { letter: 'D', text: 'Eu aplico metodologias testadas e validadas no trabalho', factor: 'C' }
  ]},
  { group: 24, statements: [
    { letter: 'A', text: 'Eu assumo responsabilidade total e não fujo de obrigações', factor: 'D' },
    { letter: 'B', text: 'Euspraizo a todos e deixo marca positiva por onde passo', factor: 'I' },
    { letter: 'C', text: 'Eu crio ambientes seguros e acolhedores para a equipe', factor: 'S' },
    { letter: 'D', text: 'Eu garanto que regulamentos e normas sejam cumpridos à risca', factor: 'C' }
  ]}
]

export const FUNCTION_PROFILES = {
  'Vendas': { D: 70, I: 85, S: 40, C: 30 },
  'Liderança': { D: 90, I: 60, S: 50, C: 40 },
  'Atendimento': { D: 35, I: 70, S: 85, C: 40 },
  'Financeiro': { D: 30, I: 25, S: 60, C: 90 },
  'Marketing': { D: 55, I: 80, S: 30, C: 45 },
  'Operações': { D: 50, I: 30, S: 75, C: 70 },
  'RH': { D: 40, I: 75, S: 80, C: 45 },
  'TI': { D: 35, I: 25, S: 55, C: 85 },
  'Produção': { D: 55, I: 25, S: 75, C: 65 },
  'Administração': { D: 45, I: 40, S: 65, C: 75 },
  'Ensino': { D: 35, I: 80, S: 70, C: 40 },
  'Criativo': { D: 45, I: 65, S: 30, C: 70 }
}

export const TYPE_DESCRIPTIONS = {
  D: {
    name: 'Dominante',
    shortName: 'D',
    description: 'Pessoas com perfil D são diretas, decididas e orientadas a resultados. Lideram naturalmente, enfrentam desafios e valorizam eficiência. Podem ser vistas como autoritárias ou impacientes.',
    color: '#EF4444',
    strengths: ['Decisão rápida e firmeza', 'Orientação a resultados', 'Capacidade de liderança', 'Resiliência diante de desafios', 'Coragem para assumir riscos', 'Foco na eficiência'],
    weaknesses: ['Impaciência com processos lentos', 'Tendência a ser autoritário', 'Dificuldade em delegar', 'Pode insensível com sentimentos alheios', 'Excessiva competitividade', 'Resistência a feedbacks'],
    attentionPoints: ['Monopolizar decisões e não ouvir a equipe', 'Pressionar demais por resultados gerando burnout', 'Ignorar o processo e focar apenas no resultado', 'Ser perceived como agressivo ou intimidador'],
    howToManage: ['Deixe claro o objetivo e o prazo — D's se motivam com metas claras', 'Apresente fatos e dados, não opiniões', 'Dê autonomia dentro de limites definidos', 'Reconheça resultados publicamente', 'Não leve desafios pessoais — é orientação a resultado, não ataque pessoal'],
    howToDodgeNegatives: ['Pratique escuta ativa: faça perguntas antes de dar soluções', 'Antes de decidir sozinho, pergunte a opinião de ao menos 2 pessoas', 'Reconheça esforços, não apenas resultados', 'Substitua "faça já" por "como podemos resolver isso juntos?"'],
    idealEnvironment: 'Ambientes competitivos, com metas claras e autonomia para decidir.',
    stressTriggers: 'Indecisão, processos burocráticos lentos, micromanagement',
    motivationKeys: 'Desafios, poder de decisão, reconhecimento por resultados',
    communicationStyle: 'Direta, objetiva, vai ao ponto. Prefere resumos e decisões.'
  },
  I: {
    name: 'Influente',
    shortName: 'I',
    description: 'Pessoas com perfil I são entusiasmadas, comunicativas e persuasivas. Conectam-se facilmente, inspiram equipes e valorizam relacionamentos. Podem ser vistas como impulsivas ou dispersas.',
    color: '#F59E0B',
    strengths: ['Comunicação e carisma', 'Capacidade de inspirar e motivar', 'Networking natural', 'Criatividade e visão', 'Adaptabilidade social', 'Entusiasmo contagiante'],
    weaknesses: ['Impulsividade e falta de follow-through', 'Dificuldade com detalhes e rotinas', 'Tendência a prometer mais do que pode entregar', 'Desorganização e distração', 'Evita conflitos a todo custo', 'Superficialidade em relações'],
    attentionPoints: ['Prometer mais do que consegue cumprir', 'Focar tanto nas pessoas que perde o foco nos resultados', 'Evitar confrontos necessários', 'Ser perceived como superficial ou inconsistente'],
    howToManage: ['Dê atenção pessoal e reconhecimento — I's se motivam com aprovação', 'Deixe espaço para criatividade e社交ização', 'Associe tarefas a impacto nas pessoas', 'Defina prazos claros e check-ins frequentes', 'Ajude a priorizar e focar'],
    howToDodgeNegatives: ['Use listas de verificação para não perder detalhes', 'Antes de comprometer, pergunte: "Consigo entregar isso no prazo sem comprometer nada?"', 'Reserve tempo silencioso para refletir antes de decidir', 'Pratique fechar ciclos: toda promessa vira uma tarefa com prazo'],
    idealEnvironment: 'Ambientes sociais, colaborativos, com variedade e Reconhecimento.',
    stressTriggers: 'Isolamento, críticas públicas, rotinas monótonas, falta de reconhecimento',
    motivationKeys: 'Reconhecimento público, interação social, liberdade criativa, variedade',
    communicationStyle: 'Expressiva, emocional, usa histórias e exemplos. Prefere conversar cara a cara.'
  },
  S: {
    name: 'Estável',
    shortName: 'S',
    description: 'Pessoas com perfil S são pacientes, leais e confiáveis. Valorizam harmonia, oferecem suporte constante e preferem ambientes previsíveis. Podem ser vistas como resistentes a mudanças.',
    color: '#10B981',
    strengths: ['Confiabilidade e consistência', 'Paciência e empatia', 'Lealdade e dedication', 'Capacidade de escuta ativa', 'Trabalho em equipe excepcional', 'Estabilidade emocional'],
    weaknesses: ['Resistência a mudanças', 'Evita conflitos a ponto de se prejudicar', 'Dificuldade em dizer não', 'Pode ser lento para tomar decisões', 'Subestima suas próprias capacidades', 'Tendência a se sobrecarregar por não delegar'],
    attentionPoints: ['Aceitar tudo sem questionar, acumulando frustração', 'Demorar demais para se posicionar ou decidir', 'Não pedir ajuda quando sobrecarregado', 'Ser perceived como passivo ou desmotivado'],
    howToManage: ['Seja gentil e paciente — S's respondem a abordagem calorosa', 'Apresente mudanças gradualmente com explicação clara', 'Reconheça estabilidade e confiabilidade', 'Dê tempo para se adaptar a novas situações', 'Crie ambiente seguro para expressar opiniões'],
    howToDodgeNegatives: ['Pratique dizer não pelo menos 1 vez por dia em situações pequenas', 'Quando sentir resistência a uma mudança, pergunte: "Qual é o pior que pode acontecer?"', 'Defina marcos pessoais claros: o que aceito e o que não aceito', 'Antes de assumir mais trabalho, pergunte: "Isso está na minha lista de prioridades?"'],
    idealEnvironment: 'Ambientes estáveis, colaborativos, com rotina clara e segurança.',
    stressTriggers: 'Mudanças bruscas, conflitos, falta de segurança, prazos imprevisíveis',
    motivationKeys: 'Segurança, pertencimento, reconhecimento silencioso, trabalho em equipe',
    communicationStyle: 'Cuidadosa, calma, prefere ouvir antes de falar. Valoriza tom amigável.'
  },
  C: {
    name: 'Consciencioso',
    shortName: 'C',
    description: 'Pessoas com perfil C são analíticas, precisas e sistemáticas. Valorizam qualidade, seguem procedimentos e buscam exatidão. Podem ser vistas como perfeccionistas ou excessivamente cautelosas.',
    color: '#3B82F6',
    strengths: ['Precisão e atenção aos detalhes', 'Pensamento analítico e lógico', 'Organização e método', 'Compromisso com qualidade', 'Fiabilidade nas entregas', 'Capacidade de encontrar erros e inconsistências'],
    weaknesses: ['Perfeccionismo que atrasa entregas', 'Excesso de análise que paralisa decisões', 'Dificuldade com ambiguidade', 'Pode ser perceived como crítico ou frio', 'Resistência a assumir riscos', 'Foco no que está errado em vez do que está certo'],
    attentionPoints: ['Paralisia por análise: detalhar demais e não avançar', 'Criticar mais do que elogiar, desmotivando a equipe', 'Elevados padrões que ninguém consegue atingir', 'Ser perceived como inflexível ou difídecil de agradar'],
    howToManage: ['Apresente dados e evidências — C's decidem com fatos', 'Defina padrões claros e expectativas mensuráveis', 'Dê tempo para análise antes de exigir resposta', 'Reconheça a qualidade e precisão do trabalho', 'Permita que revisem e validem antes de finalizar'],
    howToDodgeNegatives: ['Defina limites de tempo para análise: "decido em 1 hora" e cumpra', 'Para cada crítica, faça 1 elogio específico', 'Aceite que "bom o suficiente" às vezes é o melhor caminho', 'Pratique agir com 80% das informações em vez de esperar 100%'],
    idealEnvironment: 'Ambientes organizados, com processos claros e padrões definidos.',
    stressTriggers: 'Falta de clareza, erros, ambiguidade, críticas ao trabalho detalhado',
    motivationKeys: 'Qualidade, precisão, reconhecimento por competência, ambiente organizado',
    communicationStyle: 'Factual, detalhada, prefere comunicação escrita. Usa dados e evidências.'
  }
}

export const TYPE_TIPS = {
  D: {
    'Vendas': 'Use sua determinação para bater metas, mas desenvolva escuta ativa para entender melhor o cliente. O cliente que se sente ouvido compra mais.',
    'Liderança': 'Seu natural comando é uma força, mas lembre de incluir a equipe nas decisões. Líderes que escutam antes de decidir geram mais engajamento.',
    'Atendimento': 'Sua eficiência é valiosa, mas pratique mais empatia e paciência com o cliente. Respire fundo antes de responder com pressa.',
    'Financeiro': 'Você pode acelerar processos, mas cuidado para não pular etapas de verificação importantes que protegem a empresa.',
    'Marketing': 'Seu foco em resultados impulsiona campanhas, mas desenvolva sensibilidade para mensagens criativas que conectam emocionalmente.',
    'Operações': 'Sua ação rápida resolve problemas, mas desenvolva melhor planejamento de longo prazo para evitar firefighting constante.',
    'RH': 'Sua liderança inspira, mas desenvolva sensibilidade para lidar com pessoas mais vulneráveis. Nem todo mundo responde bem a pressão.',
    'TI': 'Você resolve crises rápido, mas desenvolva paciência para detalhes técnicos que previnem problemas futuros.',
    'Produção': 'Sua energia move a produção, mas cuidado para não pressionar demais a equipe e gerar rotatividade.',
    'Administração': 'Sua capacidade decisiva é valiosa, mas desenvolva mais atenção a processos e regulamentos que protegem a organização.',
    'Ensino': 'Você domina a sala, mas desenvolva mais escuta e paciência com ritmos diferentes de aprendizagem.',
    'Criativo': 'Sua visão direciona projetos, mas desenvolva abertura para ideias divergentes que enriquecem o resultado.'
  },
  I: {
    'Vendas': 'Seu carisma natural é perfeito para vendas. Desenvolva suivi organizado para não perder oportunidades que surgem pela desorganização.',
    'Liderança': 'Você inspira a equipe, mas desenvolva firmeza nas decisões difíceis. Nem tudo pode ser resolvido com bom humor.',
    'Atendimento': 'Sua comunicação é um ativo, mas cuidado para não prometer mais do que pode entregar. O cliente lembra das promessas.',
    'Financeiro': 'Sua rede de contatos ajuda, mas desenvolva mais rigor com números e detalhes. Verificação dupla é seu amiga.',
    'Marketing': 'Perfeito! Sua criatividade e comunicação brilham aqui. Mantenha o foco em resultados mensuráveis além da criatividade.',
    'Operações': 'Sua energia social é boa, mas desenvolva mais atenção a processos e cronogramas. Detalhes importam.',
    'RH': 'Seu talento com pessoas é ideal aqui. Desenvolva estrutura para não deixar tarefas caírem pelas frestas.',
    'TI': 'Sua comunicação ajuda na ponte com usuários, mas desenvolva mais foco em detalhes técnicos que garantem qualidade.',
    'Produção': 'Você anima a equipe, mas desenvolva mais consistência e rotina no dia a dia. A produção precisa de regularidade.',
    'Administração': 'Sua rede de contatos é valiosa, mas desenvolva mais organização documental. Papéis em dia evitam problemas.',
    'Ensino': 'Perfeito! Sua comunicação engaja alunos. Desenvolva mais estrutura nas avaliações para ser justo com todos.',
    'Criativo': 'Sua energia e visão brilham aqui. Desenvolva mais disciplina para finalizar projetos, não apenas começar.'
  },
  S: {
    'Vendas': 'Sua confiabilidade constrói relacionamentos longos, mas desenvolva mais assertividade no fechamento. Clientes respeitam quem pede a venda.',
    'Liderança': 'Você é um líder servidor, mas desenvolva mais firmeza nas decisões difíceis. A equipe precisa de direção clara.',
    'Atendimento': 'Perfeito! Sua paciência e empatia são ideais para atendimento. Cuidado para não se sobrecarregar absorvendo problemas dos outros.',
    'Financeiro': 'Sua consistência é valiosa, mas desenvolva mais proatividade na análise. Antecipe problemas em vez de apenas reagir.',
    'Marketing': 'Sua escuta é um ativo, mas desenvolva mais ousadia nas campanhas. O mercado recompensa quem ousa.',
    'Operações': 'Perfeito! Sua constância e confiabilidade são ideais para operações. Mantenha e continue evoluindo processos.',
    'RH': 'Perfeito! Sua empatia e paciência são ideais para RH. Cuide para não se sobrecarregar emocionalmente com os problemas dos outros.',
    'TI': 'Sua paciência é boa para debug, mas desenvolva mais proatividade na solução. Antecipe problemas em vez de esperar acontecer.',
    'Produção': 'Perfeito! Sua constância e dedicação são ideais para produção. Mantenha o ritmo e cuide da sua saúde física.',
    'Administração': 'Sua organização é valiosa, mas desenvolva mais iniciativa para propor melhorias. Sua visão de processo é única.',
    'Ensino': 'Sua paciência é ideal, mas desenvolva mais dinamismo para engajar turmas grandes e manter a energia alta.',
    'Criativo': 'Sua estabilidade é boa para edição, mas desenvolva mais abertura para experimentar. Inovação exige tentar o novo.'
  },
  C: {
    'Vendas': 'Sua preparação é impecável, mas desenvolva mais espontaneidade e conexão emocional. Pessoas compram de pessoas, não de planilhas.',
    'Liderança': 'Sua análise é valiosa, mas desenvolva mais velocidade nas decisões. Nem toda decisão precisa de todos os dados.',
    'Atendimento': 'Sua precisão é valiosa, mas desenvolva mais empatia e flexibilidade. Protocolos importam, mas conexão humana importa mais.',
    'Financeiro': 'Perfeito! Seu rigor e atenção aos detalhes são ideais para finanças. Continue mantendo os padrões altos.',
    'Marketing': 'Sua análise de dados é valiosa, mas desenvolva mais criatividade e intuição. Dados mostram o que aconteceu; intuição mostra o que pode acontecer.',
    'Operações': 'Sua organização é valiosa, mas desenvolva mais flexibilidade para imprevistos. Planos perfeitos foundam com a primeira surpresa.',
    'RH': 'Sua justiça e imparcialidade são boas, mas desenvolva mais sensibilidade com pessoas. Nem tudo é lógico no mundo das emoções.',
    'TI': 'Perfeito! Seu pensamento lógico e atenção aos detalhes são ideais para TI. Mantenha os padrões altos.',
    'Produção': 'Seu controle de qualidade é valioso, mas desenvolva mais velocidade na execução. Perfeito é inimigo do feito.',
    'Administração': 'Perfeito! Sua organização e método são ideais para administração. Mantenha a consistência.',
    'Ensino': 'Sua precisão é valiosa, mas desenvolva mais dinâmica para engajar alunos. Variedade mantém a atenção.',
    'Criativo': 'Sua atenção aos detalhes é valiosa, mas desenvolva mais ousadia e experimentação. Sem risco não há inovação.'
  }
}
}

export const TYPE_TIPS = {
  D: {
    'Vendas': 'Use sua determinação para bater metas, mas developeda escuta ativa para entender melhor o cliente.',
    'Liderança': 'Seu natural comando é um asset, mas lembre de incluir a equipe nas decisões.',
    'Atendimento': 'Sua eficiência é valiosa, mas pratique mais empatia e paciência com o cliente.',
    'Financeiro': 'Você pode acelerar processos, mas cuidado para não pular etapas de verificação importantes.',
    'Marketing': 'Seu foco em resultados impulsiona campanhas, mas developeda sensibilidade para mensagens criativas.',
    'Operações': 'Sua ação rápida resolve problemas, mas developeda melhor planejamento de longo prazo.',
    'RH': 'Sua liderança inspira, mas developeda sensibilidade para lidar com pessoas mais vulneráveis.',
    'TI': 'Você resolve crises rápido, mas developeda paciência para detalhes técnicos.',
    'Produção': 'Sua energia move a produção, mas cuidado para não pressionar demais a equipe.',
    'Administração': 'Sua capacidade decisiva é valiosa, mas developeda mais atenção a processos e regulamentos.',
    'Ensino': ' Você domina a sala, mas developeda mais escuta e paciência com ritmos diferentes.',
    'Criativo': 'Sua visão direciona projetos, mas developeda abertura para ideias divergentes.'
  },
  I: {
    'Vendas': 'Seu carisma natural é perfeito para vendas. Developeda suivi organizado para não perder oportunidades.',
    'Liderança': 'Você inspira a equipe, mas developeda firmeza nas decisões difíceis.',
    'Atendimento': 'Sua comunicação é um asset, mas cuidado para não prometer mais do que pode entregar.',
    'Financeiro': 'Sua rede de contatos ajuda, mas developeda mais rigor com números e detalhes.',
    'Marketing': 'Perfeito! Sua criatividade e comunicação brilham aqui. Mantenha o foco em resultados mensuráveis.',
    'Operações': 'Sua energia social é boa, mas developeda mais atenção a processos e cronogramas.',
    'RH': 'Seu talento com pessoas é ideal aqui. Developedá estrutura para não deixar tarefas cair.',
    'TI': 'Sua comunicação ajuda na ponte com usuários, mas developeda mais foco em detalhes técnicos.',
    'Produção': 'Você anima a equipe, mas developeda mais consistência e rotina no dia a dia.',
    'Administração': 'Sua rede de contatos é valiosa, mas developedá mais organização documental.',
    'Ensino': 'Perfeito! Sua comunicação engaja alunos. Developedá mais estrutura nas avaliações.',
    'Criativo': 'Sua energia e visão brilham aqui. Developedá mais disciplina para finalizar projetos.'
  },
  S: {
    'Vendas': 'Sua confiabilidade constrói relacionamentos longos, mas developeda mais assertividade no fechamento.',
    'Liderança': 'Você é uma líder servidora, mas developeda mais firmeza nas decisões difíceis.',
    'Atendimento': 'Perfeito! Sua paciência e empatia são ideais para atendimento. Cuidado para não se sobrecarregar.',
    'Financeiro': 'Sua consistência é valiosa, mas developedá mais proatividade na análise.',
    'Marketing': 'Sua escuta é um asset, mas developedá mais ousadia nas campanhas.',
    'Operações': 'Perfeito! Sua constância e confiabilidade são ideais para operações. Mantenha.',
    'RH': 'Perfeito! Sua empatia e paciência são ideais para RH. Cuidado com sobrecarga emocional.',
    'TI': 'Sua paciência é boa para debug, mas developeda mais proatividade na solução.',
    'Produção': 'Perfeito! Sua constância e dedicação são ideais para produção. Mantenha.',
    'Administração': 'Sua organização é valiosa, mas developedá mais iniciativa para propor melhorias.',
    'Ensino': 'Sua paciência é ideal, mas developedá mais dinamismo para engajar turmas grandes.',
    'Criativo': 'Sua estabilidade é boa para edição, mas developedá mais abertura para experimentar.'
  },
  C: {
    'Vendas': 'Sua preparação é impecável, mas developeda mais espontaneidade e conexão emocional.',
    'Liderança': 'Sua análise é valiosa, mas developeda mais velocidade nas decisões e feedback.',
    'Atendimento': 'Sua precisão é valiosa, mas developeda mais empatia e flexibilidade.',
    'Financeiro': 'Perfeito! Seu rigor e atenção aos detalhes são ideais para finanças. Mantenha.',
    'Marketing': 'Sua análise de dados é valiosa, mas developeda mais criatividade e intuição.',
    'Operações': 'Sua organização é valiosa, mas developeda mais flexibilidade para imprevistos.',
    'RH': 'Sua justiça e imparcialidade são boas, mas developeda mais sensibilidade com pessoas.',
    'TI': 'Perfeito! Seu pensamento lógico e atenção aos detalhes são ideais para TI. Mantenha.',
    'Produção': 'Seu controle de qualidade é valioso, mas developeda mais velocidade na execução.',
    'Administração': 'Perfeito! Sua organização e método são ideais para administração. Mantenha.',
    'Ensino': 'Sua precisão é valiosa, mas developeda mais dinâmica para engajar alunos.',
    'Criativo': 'Sua atenção aos detalhes é valiosa, mas developeda mais ousadia e experimentação.'
  }
}

export function calculateDISCScores(responses) {
  const scores = { D: 0, I: 0, S: 0, C: 0 }
  for (const response of responses) {
    const mostFactor = CHOICE_MAP[response.most]
    const leastFactor = CHOICE_MAP[response.least]
    if (mostFactor) scores[mostFactor] += 1
    if (leastFactor) scores[leastFactor] -= 1
  }
  return scores
}

export function calculatePercentages(scores) {
  const keys = ['D', 'I', 'S', 'C']
  const normalized = {}
  const raw = {}
  for (const k of keys) {
    raw[k] = ((scores[k] + 24) / 48) * 100
  }
  const sum = raw.D + raw.I + raw.S + raw.C
  for (const k of keys) {
    normalized[k] = sum > 0 ? Math.round((raw[k] / sum) * 100) : 25
  }
  const diff = 100 - (normalized.D + normalized.I + normalized.S + normalized.C)
  if (diff !== 0) {
    const maxKey = keys.reduce((a, b) => normalized[a] >= normalized[b] ? a : b)
    normalized[maxKey] += diff
  }
  return normalized
}

export function getDominantType(percentages) {
  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1])
  return { dominant: sorted[0][0], secondary: sorted[1][0] }
}

export function calculateFit(employeePercentages, functionCategory) {
  const idealProfile = FUNCTION_PROFILES[functionCategory]
  if (!idealProfile) return 0

  const keys = ['D', 'I', 'S', 'C']
  const empValues = keys.map(k => employeePercentages[k])
  const idealValues = keys.map(k => idealProfile[k])

  const n = empValues.length
  const meanEmp = empValues.reduce((a, b) => a + b, 0) / n
  const meanIdeal = idealValues.reduce((a, b) => a + b, 0) / n

  let sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    const dx = empValues[i] - meanEmp
    const dy = idealValues[i] - meanIdeal
    sumXY += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }

  const denominator = Math.sqrt(sumX2 * sumY2)
  if (denominator === 0) {
    let sumSqDiff = 0
    for (let i = 0; i < n; i++) {
      sumSqDiff += (empValues[i] - idealValues[i]) ** 2
    }
    const maxDist = Math.sqrt(4 * 100 * 100)
    return Math.max(0, Math.min(100, Math.round((1 - Math.sqrt(sumSqDiff) / maxDist) * 100)))
  }

  const pearson = sumXY / denominator
  return Math.max(0, Math.min(100, Math.round(((pearson + 1) / 2) * 100)))
}

export function generateAnalysis(employeePercentages, functionCategories) {
  const { dominant, secondary } = getDominantType(employeePercentages)
  const typeInfo = TYPE_DESCRIPTIONS[dominant]

  const categoryFits = []
  if (functionCategories && functionCategories.length > 0) {
    for (const cat of functionCategories) {
      categoryFits.push({
        functionName: cat,
        fitPercentage: calculateFit(employeePercentages, cat)
      })
    }
  }

  const currentFunctionName = functionCategories && functionCategories.length > 0 ? functionCategories[0] : null
  const currentFunctionFit = currentFunctionName ? calculateFit(employeePercentages, currentFunctionName) : 0

  const allFits = Object.keys(FUNCTION_PROFILES).map(fn => ({
    functionName: fn,
    fitPercentage: calculateFit(employeePercentages, fn)
  })).sort((a, b) => b.fitPercentage - a.fitPercentage)

  const top3Recommendations = allFits.slice(0, 3).map(fit => ({
    ...fit,
    reason: getRecommendationReason(dominant, fit.functionName, fit.fitPercentage)
  }))

  const improvementTips = currentFunctionName
    ? (TYPE_TIPS[dominant]?.[currentFunctionName] || 'Continue desenvolvendo suas competências.')
    : 'Selecione uma função para receber dicas específicas.'

  const strengthsInCurrentRole = currentFunctionName
    ? getStrengths(dominant, secondary, currentFunctionName)
    : ''

  const challengesInCurrentRole = currentFunctionName
    ? getChallenges(dominant, currentFunctionName)
    : ''

  return {
    currentFunctionFit,
    currentFunctionName: currentFunctionName || 'Não informado',
    recommendations: top3Recommendations,
    improvementTips,
    strengthsInCurrentRole,
    challengesInCurrentRole,
    profileDetails: {
      strengths: typeInfo.strengths,
      weaknesses: typeInfo.weaknesses,
      attentionPoints: typeInfo.attentionPoints,
      howToManage: typeInfo.howToManage,
      howToDodgeNegatives: typeInfo.howToDodgeNegatives,
      idealEnvironment: typeInfo.idealEnvironment,
      stressTriggers: typeInfo.stressTriggers,
      motivationKeys: typeInfo.motivationKeys,
      communicationStyle: typeInfo.communicationStyle,
      secondaryType: TYPE_DESCRIPTIONS[secondary]?.name || ''
    }
  }
}

function getRecommendationReason(dominant, functionName, fitPercentage) {
  if (fitPercentage >= 80) return `Seu perfil ${TYPE_DESCRIPTIONS[dominant].name} tem alta compatibilidade com ${functionName}.`
  if (fitPercentage >= 60) return `Seu perfil ${TYPE_DESCRIPTIONS[dominant].name} tem boa compatibilidade com ${functionName}.`
  return `Seu perfil ${TYPE_DESCRIPTIONS[dominant].name} tem compatibilidade moderada com ${functionName}.`
}

function getStrengths(dominant, secondary, functionName) {
  const strengths = {
    D: 'Determinação, foco em resultados, capacidade decisiva',
    I: 'Comunicação, persuasão, capacidade de inspirar pessoas',
    S: 'Confiabilidade, paciência, consistência na execução',
    C: 'Precisão, organização, análise detalhada'
  }
  return strengths[dominant] || 'Versatilidade e adaptação'
}

function getChallenges(dominant, functionName) {
  const challenges = {
    D: 'Pode ser impaciente e diretiva demais; precisa desenvolver escuta',
    I: 'Pode ser impulsiva e dispersa; precisa desenvolver foco e organização',
    S: 'Pode ser resistente a mudanças; precisa desenvolver proatividade',
    C: 'Pode ser perfeccionista e lenta; precisa desenvolver agilidade'
  }
  return challenges[dominant] || 'Desenvolver autoconhecimento'
}