class FindAllOrdersUseCase {
    constructor(findAllOrdersRepository) {
        this.findAllOrdersRepository = findAllOrdersRepository;
    }

    async execute() {
        const orders = await this.findAllOrdersRepository.execute();
        return orders || [];
    }
}

export default FindAllOrdersUseCase;
