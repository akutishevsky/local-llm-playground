export const MessageType = {
    INBOUND: "inbound",
    OUTBOUND: "outbound"
};

const createAvatarElement = (messageElement, avatarIcon) => {
    const avatarWrapper = document.createElement("span");
    avatarWrapper.setAttribute("aria-hidden", "true");
    avatarWrapper.classList.add(
        "slds-avatar",
        "slds-avatar_circle",
        "slds-chat-avatar"
    );

    const avatarInitials = document.createElement("span");
    avatarInitials.classList.add(
        "slds-avatar__initials",
        "slds-avatar__initials_inverse"
    );
    avatarInitials.innerText = avatarIcon;

    avatarWrapper.appendChild(avatarInitials);
    messageElement.appendChild(avatarWrapper);
};

const createChatElements = (component, messageType) => {
    const chatContainer = component.template.querySelector(".slds-chat");

    const listItem = document.createElement("li");
    listItem.classList.add(
        "slds-chat-listitem",
        `slds-chat-listitem_${messageType}`
    );

    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("slds-chat-message");

    createAvatarElement(
        messageWrapper,
        messageType === MessageType.INBOUND ? "🤖" : "🧑‍💻"
    );

    return { chatContainer, listItem, messageWrapper };
};

const createMessageBodyElements = (messageType) => {
    const messageBody = document.createElement("div");
    messageBody.classList.add("slds-chat-message__body");

    const messageText = document.createElement("div");
    messageText.classList.add(
        "slds-chat-message__text",
        `slds-chat-message__text_${messageType}`
    );

    return { messageBody, messageText };
};

const appendMessageText = (message, messageTextElement) => {
    if (!message) return;

    const textElement = document.createElement("span");
    textElement.innerText = message;
    messageTextElement.appendChild(textElement);
};

export const renderMessage = (component, messageType, message) => {
    const { chatContainer, listItem, messageWrapper } = createChatElements(
        component,
        messageType
    );
    const { messageBody, messageText } = createMessageBodyElements(messageType);

    appendMessageText(message, messageText);

    messageBody.appendChild(messageText);
    messageWrapper.appendChild(messageBody);
    listItem.appendChild(messageWrapper);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(listItem);
    chatContainer.appendChild(fragment);

    return messageText;
};
