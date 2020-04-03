import Helper from "./helper";

import Message from "./Message";
import Node from "./Node";
import Repeater from "./Repeater";
import Registry from "./Registry";
import Router from "./Router";

import MasterNode from "./MasterNode";

import MessageReceptionSequencer from "./MessageReceptionSequencer";
import Rule from "./Rule";
import RuleFactory from "./RuleFactory";

import Browser from "./browser/package";
import Network from "./network/package";
import Worker from "./worker/package";

import Modules from "./modules/package";

export default {
    Helper,
    
    Message,
    Node,
    Repeater,
    Registry,
    Router,

    MasterNode,

    MessageReceptionSequencer,
    Rule,
    RuleFactory,

    $: {
        MSRP: MessageReceptionSequencer.Process,    // Elevated, as this is intended to be the primary access mode for all Message reception
        RP: Rule.Process,
        RFP: RuleFactory.Process,
    },
    
    Browser,
    Network,
    Worker,
    
    Modules,
};