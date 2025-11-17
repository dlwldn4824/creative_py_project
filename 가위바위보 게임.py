import random

def rps_game():
    options = ["가위", "바위", "보"]
    computer = random.choice(options)
    
    user = input("가위, 바위, 보 중 하나를 입력하세요: ")

    if user not in options:
        print("❌ 잘못 입력했습니다!")
        return

    print(f"컴퓨터: {computer}")
    print(f"사용자: {user}")

    if user == computer:
        print("➖ 무승부!")
    elif (user == "가위" and computer == "보") or \
         (user == "바위" and computer == "가위") or \
         (user == "보" and computer == "바위"):
        print("✅ 당신이 이겼습니다!")
    else:
        print("❌ 당신이 졌습니다!")
