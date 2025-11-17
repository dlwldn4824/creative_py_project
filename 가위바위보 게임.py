import random
import time

# -------------------------------
# 1. 가위바위보 함수
# -------------------------------
def rps_game():
    options = ["가위", "바위", "보"]
    computer = random.choice(options)

    user = input("가위, 바위, 보 중 하나를 입력하세요: ")

    if user not in options:
        print("❌ 잘못 입력했습니다!")
        return

    print(f"\n컴퓨터: {computer}")
    print(f"사용자: {user}")

    if user == computer:
        print("➖ 무승부!")
    elif (user == "가위" and computer == "보") or \
         (user == "바위" and computer == "가위") or \
         (user == "보" and computer == "바위"):
        print("✅ 당신이 이겼습니다!")
    else:
        print("❌ 당신이 졌습니다!")

# -------------------------------
# 2. 룰렛 함수
# -------------------------------
def roulette(items):
    if not items:
        print("❌ 항목이 없습니다!")
        return

    print("\n🎰 룰렛을 돌리는 중...")
    for _ in range(15):
        print(".", end="", flush=True)
        time.sleep(0.1)

    result = random.choice(items)
    print(f"\n🎯 룰렛 결과: {result}")
    return result

# -------------------------------
# 3. 메뉴(메인 프로그램)
# -------------------------------
def main():
    while True:
        print("\n==============================")
        print("       🎮 선택 메뉴 🎮")
        print("==============================")
        print("1. 가위바위보")
        print("2. 룰렛 돌리기")
        print("3. 종료")
        print("==============================")

        choice = input("번호를 선택하세요: ")

        if choice == "1":
            rps_game()

        elif choice == "2":
            print("\n룰렛에 넣을 항목을 입력하세요.")
            print("예: 치킨, 피자, 햄버거")
            items = input("항목들: ").split(",")
            items = [x.strip() for x in items]
            roulette(items)

        elif choice == "3":
            print("👋 프로그램을 종료합니다.")
            break

        else:
            print("❌ 잘못된 번호입니다. 다시 입력하세요.")

# 프로그램 시작
if __name__ == "__main__":
    main()
