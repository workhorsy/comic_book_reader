const actions = store => ({
  setLoadedArchive(prevState, archive) {
    const { reader } = prevState
    // const {name, totalPages}
    return {
      ...prevState,
      reader: {
        ...reader,
        pages: [],
        archive: {
          ...reader.archive,
          ...archive,
        },
        isLoading: true,
      },
    }
  },

  setCurrentPage(prevState, pageNumber) {
    return {
      ...prevState,
      reader: { ...prevState.reader, currentPage: pageNumber },
    }
  },

  toggleBookMode(prevState) {
    const { bookMode } = prevState.reader

    return {
      ...prevState,
      reader: { ...prevState.reader, bookMode: !bookMode },
    }
  },

  showLoadingScreen(prevState, show) {
    const { reader } = prevState
    return {
      ...prevState,
      reader: { ...reader, isLoading: show },
    }
  },

  showError(prevState, show) {
    const { reader } = prevState
    return {
      ...prevState,
      reader: { ...reader, error: show },
    }
  },

  addPage(prevState, page) {
    const { reader } = prevState
    return {
      ...prevState,
      reader: {
        ...reader,
        loadedPages: reader.loadedPages + 1,
        pages: reader.pages.concat(page),
      },
    }
  },
})

export default actions
