let notebooks = [
  {
    id: '0',
    name: 'Seneca',
    owner: 'x5e2612d-4eb7-4265-b4b5-4c845a2825f7',
    content: '"We suffer more often in imagination than in reality. True happiness is... to enjoy the present, without anxious dependence upon the future. Difficulties strengthen the mind, as labor does the body.',
    public: true,
  },
  {
    id: '1',
    name: 'Marcus Aurelius',
    owner: 'x5e2612d-4eb7-4265-b4b5-4c845a2825f7',
    content: 'The best revenge is to be unlike him who performed the injury. You have power over your mind, not outside events. Realize this, and you will find strength. "Very little is needed to make a happy life; it is all within yourself, in your way of thinking".',
    public: true,
  },
  {
    id: '2',
    name: 'Work Projects',
    owner: 'b5e2612d-4eb7-4265-b4b5-4c845a2825f7',
    content: 'Work ProjectsWork ProjectsWork ProjectsWork ProjectsWork ProjectsWork Projects'
  },
  {
    id: '3',
    name: 'Personal Journal',
    owner: 'b5e2612d-4eb7-4265-b4b5-4c845a2825f7',
    content: '@@@ Personal JournalPersonal JournalPersonal JournalPersonal JournalPersonal Journal'
  },
  {
    id: '4',
    name: 'Recipe Collection',
    owner: '81d58348-a380-4ee9-a864-4d3d62915307',
    content: 'Recipe CollectionRecipe CollectionRecipe CollectionRecipe CollectionRecipe CollectionRecipe Collection'
  },
  {
    id: '5',
    name: 'Travel Plans',
    owner: '81d58348-a380-4ee9-a864-4d3d62915307',
    content: 'EuropeEuropeEuropeEuropeEuropeEuropeEurope'
  },
  {
    id: '6',
    name: 'Study Notes',
    owner: 'b5e2612d-4eb7-4265-b4b5-4c845a2825f7',
    content: 'formal verification, must, tla+'
  }
];

class NotebooksRepository {
    async findByOwner(ownerId) {
        return notebooks.filter(notebook => notebook.public || notebook.owner === ownerId);
    }
    async saveNotebook(notebook) {
        notebooks.push(notebook);
    }
    async findById(notebookId) {
        return notebooks.find(notebook => notebook.id === notebookId);
    }
    async putNotebook(notebookId, notebook) {
        console.log("putting notebook in repo", notebookId, notebook);
        const n = notebooks.find(notebook => notebook.id == notebookId);
        if (!n) {
          return null;
        } else {
          n.name = notebook.name;
          n.content = notebook.content;
        }
        return n;
    }
    async deleteNotebook(notebookId) {
      notebooks = notebooks.filter(n => n.id !== notebookId);
    }
}

module.exports = {
  notebooksRepository: new NotebooksRepository(),
};
