
class DistressEvent extends ex.GameEvent {

    constructor(public enemy: Enemy) {
        super();
    }
}

class AttackEvent extends ex.GameEvent {

    constructor(public enemy: Enemy) {
        super();
    }
}